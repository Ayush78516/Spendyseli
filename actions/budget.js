"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function getCurrentBudget(accountId){
    try{
        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");

        const user=await db.user.findUnique({
            where:{clerkUserId:userId}
        });

        if(!user){
            throw new Error("User not found");
        }

        const budget=await db.budget.findFirst({
            where:{
                userId:user.id,
            }
        });

            const currentDate = new Date();
            // Go 3 months back
            const targetYear = currentDate.getFullYear();
            const targetMonth = currentDate.getMonth() ; // 0-based index, so Sept=8 → June=5

            // Start of that month
            const startOfMonth = new Date(targetYear, targetMonth, 1);

            // End of that month (day 0 of next month)
            const endOfMonth = new Date(targetYear, targetMonth + 1, 0);


        // const currentDate=new Date();
        // const startOfMonth=new Date(
        //     currentDate.getFullYear(),
        //     currentDate.getMonth()-1,
        //     1
        // );

        // const endOfMonth=new Date(
        //     currentDate.getFullYear(),
        //     currentDate.getMonth() + 1,
        //     0 // day 0 means the last day of the previous month.
        // );

        const expenses=await db.transaction.aggregate({
            where:{
                userId:user.id,
                type:TransactionType.EXPENSE,
                date:{
                    gte:startOfMonth,
                    lte:endOfMonth,
                },
                accountId,
            },
            _sum:{
                amount:true,
            },
        });

        return {
            budget:budget?{...budget,amount:budget.amount.toNumber()}:null,
            currentExpenses:expenses._sum.amount ? expenses._sum.amount.toNumber():0,
        };

    } catch(error){
        console.error("error fetching budget:",error);
        throw error;
    }
}


export async function updateBudget(amount){
    try{
        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");

        const user=await db.user.findUnique({
            where:{clerkUserId:userId},
        });

        if(!user){
            throw new Error("User not found");
        }

        const budget=await db.budget.upsert({
            where:{
                userId:user.id,
            },
            update:{
                amount
            },
            create:{
                userId:user.id,
                amount,
            },
        });

        revalidatePath("/dashboard");
        return{
            success:true,
            data:{...budget,amount:budget.amount.toNumber()},
        };

    } catch(error){
        console.error("Error updating budget:",error);
        return {success:false,error:error.message};
    }
}