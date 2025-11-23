import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlerts = inngest.createFunction(
  {name: "Check Budget Alerts" },
  { cron:"0 */6 * * *" },
  async ({ step }) => {
    
    const budgets=await step.run("fetch-budgets",async ()=>{
      return await db.budget.findMany({
        include:{
          user:{
            include:{
              accounts:{
                where:{
                  isDefault:true,
                }
              }
            }
          }
        }
      })
    })

    for (const budget of budgets){
      const defaultAccount = budget.user.accounts[0];
      if(!defaultAccount) continue; //skip if no default account

      await step.run(`check-budget-${budget.id}`, async () => {
         
          const currentDate = new Date();
            // Go 3 months back
          const targetYear = currentDate.getFullYear();
          const targetMonth = currentDate.getMonth() - 3; // 0-based index, so Sept=8 → June=5

          // Start of that month
          const startOfMonth = new Date(targetYear, targetMonth, 1);

          // End of that month (day 0 of next month)
          const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

        const expenses = await db.transaction.aggregate({
          where:{
            userId:budget.userId,
            accountId:defaultAccount.id, //only consider default account
            type:"EXPENSE",
            date:{
                gte:startOfMonth,
                lte:endOfMonth,
            },
          },
          _sum:{
            amount:true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if(percentageUsed>=75 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent),new Date()))
        ){

          //send email

          await sendEmail({
            to:budget.user.email,
            subject:`Budget Alert for ${defaultAccount.name}`,
            react:EmailTemplate({
              userName:budget.user.name,
              type:"budget-alert",
              data:{
                percentageUsed,
                budgetAmount:parseInt(budgetAmount).toFixed(1),
                totalExpenses:parseInt(totalExpenses).toFixed(1),
                accountName:defaultAccount.name
              },
            }),
          });

          //update lastAlertsent
          await db.budget.update({
            where:{id:budget.id},
            data:{lastAlertSent:new Date()},
          })
      }
      });
    }
  }  
);

function isNewMonth(lastAlertDate, currentDate){
  return(
    lastAlertDate.getMonth() !==currentDate.getMonth() ||
    lastAlertDate.getFullYear() !==currentDate.getFullYear()
  );
}


export const triggerRecurringTransactions = inngest.createFunction(
  {
    id:"trigger-recurring-transactions",
    name:"Trigger Recurring Transactions",
  },
  {
    cron:"0 0 * * *"
  },
  async({step})=>{
    
    //1.fetch all due recurring transactions

    const recurringTransactions=await step.run(
      "fetch-recurring-transactions",
      async()=>{
        return await db.transaction.findMany({
          where:{
            isRecurring:true,
            status:"COMPLETED",
            OR:[
              {lastProcessed:null}, //never processed
              {nextRecurringDate:{lte:new Date()}}, //due date passed
            ],
          },
        });
      }
    );

    //2. create events for each transaction
    if(recurringTransactions.length>0){
      const events=recurringTransactions.map((transaction)=>({
        name:"transaction.recurring.process",
        data:{transactionId:transaction.id,userId:transaction.userId},
      }));

      //3. send events to be processed
      await inngest.send(events);
    }
    return {triggered:recurringTransactions.length};

  }
);


export const processRecurringTransaction=inngest.createFunction(
  {
    id:"process-recurring-transaction",
    throttle:{
      limit:10,
      period:"1m",
      key:"event.data.userId",
    },
  },
  {event:"transaction.recurring.process"},
  async({event,step})=>{
    //validate event data
    if(!event?.data?.transactionId || !event?.data?.userId){
      console.error("Invalid event data:",event);
      return{error:"Missing required event data"}
    }
    await step.run("process-transaction",async()=>{
      const transaction=await db.transaction.findUnique({
        where:{
          id:event.data.transactionId,
          userId:event.data.userId,
        },
        include:{
          account:true,
        },
      });

      if(!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction(async(tx)=>{
        //create new transaction
        await tx.transaction.create({
          data:{
            type:transaction.type,
            amount:transaction.amount,
            description:`${transaction.description}(Recurring)`,
            date:new Date(),
            category:transaction.category,
            userId:transaction.userId,
            accountId:transaction.userId,
            accountId:transaction.accountId,
            isRecurring:false,
          },
        });

        //update account balance
        const balanceChange=transaction.type ==="EXPENSE"?-transaction.amount.toNumber()
        :transaction.amount.toNumber();

        await tx.account.update({
          where:{id:transaction.accountId},
          data:{balance:{increment:balanceChange}},
        });

        //update last processed date and next recurring date
        await tx.transaction.update({
          where:{id:transaction.id},
          data:{
            lastProcessed:new Date(),
            nextRecurringDate:calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    })
  }
);

function isTransactionDue(transaction){
  //if no lastProcessed date, transaction is due
  if(!transaction.lastProcessed) return true;

  const today=new Date();
  const nextDue=new Date(transaction.nextRecurringDate);
  
  //compare with nextDue date
  return nextDue<=today;
}


function calculateNextRecurringDate(startDate,interval){
    const date=new Date(startDate);

    switch(interval){
        case "DAILY":
            date.setDate(date.getDate() + 1 );   
            break; 
        case "WEEKLY":
            date.setDate(date.getDate() + 7 );   
            break; 
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1 );   
            break; 
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1 );   
            break;         
    }
    return date;
}


export const generateMonthReports=inngest.createFunction(
  {
    id:"generate-monthly-reports",
    name:"Generate Monthly Reports",
  },
  {cron:"0 0 1 * *"},  // Run every 1st day of month at midnight
  async({step})=>{

    //Get all users

    const users=await step.run("fetch-users",async()=>{
      return await db.user.findMany({
        include:{accounts:true},
      });
    });

    //For each user, generate report

    for(const user of users){
      await step.run(`generate-report${user.id}`,async()=>{

        // find the previous month

        const lastMonth=new Date();
        lastMonth.setMonth(lastMonth.getMonth()-1);

        //calculate stats

        const stats=await getMonthlyStats(user.id,lastMonth);

        // get month name like "November"
        const monthName=lastMonth.toLocaleString("default",{
          month:"long",
        });

        const insights=await generateFinancialInsights(stats,monthName);

        //send email

          await sendEmail({
            to:user.email,
            subject:`Your Monthly Financial Report ${monthName}`,
            react:EmailTemplate({
              userName:user.name,
              type:"monthly-report",
              data:{
                stats,
                month:monthName,
                insights,
              },
            }),
          });
      });
    }
    return{processed:users.length};
  }
);

async function generateFinancialInsights(stats,month){

  const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model=genAI.getGenerativeModel({model:"gemini-2.0-flash"});
  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

//func to calculate monthly stats
const getMonthlyStats=async (userId,month)=>{
  const startDate=new Date(month.getFullYear(),month.getMonth(),1);
  const endDate=new Date(month.getFullYear(),month.getMonth()+1,0);

  //get all transactions for that user and month
  const transactions=await db.transaction.findMany({
    where:{ 
      userId,
        date:{
        gte:startDate,
        lte:endDate,
      },
    },
  });
  return transactions.reduce(
    (stats,t)=>{
      const amount=t.amount.toNumber();
      if(t.type==="EXPENSE"){
        stats.totalExpenses+=amount;
        stats.byCategory[t.category]=(stats.byCategory[t.category] || 0)+amount;
      } else{
        stats.totalIncome+=amount;
      }
      return stats;
    },
    {
      totalExpenses:0,
      totalIncome:0,
      byCategory:{},
      transactionCount:transactions.length,
    }
  )
};

