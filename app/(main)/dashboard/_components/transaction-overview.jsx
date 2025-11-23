"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";

const COLORS = [
  "#FF6868",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

const DashboardOverview = ({ accounts, transactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  // -------------------- DATA LOGIC --------------------
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear()
    );
  });

  const expenseByCategory = currentMonthExpenses.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += t.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expenseByCategory).map(
    ([category, value]) => ({
      name: category,
      value,
    })
  );

  const total = pieChartData.reduce((sum, x) => sum + x.value, 0);

  // -------------------- ECHART OPTION --------------------
  const chartRef = useRef(null);

  const option = useMemo(
    () => ({
      tooltip: { trigger: "item" },

      graphic: {
        type: "text",
        id: "centerText",
        left: "center",
        top: "middle",
        style: {
            text: `Total\n${total}`,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 28,
            },
        },


      legend: {
        top: "1%",
        left: "center",
        selectedMode: false,
      },

      series: [
        {
          name: "Expenses",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "outside",
            formatter: "{b}: {c}",
          },
          labelLine: { show: true },
          emphasis: {
            scale: true,
            focus: "none",
          },
          data: pieChartData.map((d, i) => ({
            ...d,
            itemStyle: { color: COLORS[i % COLORS.length] },
          })),
        },
      ],
    }),
    [pieChartData, total]
  );

  // -------------------- HOVER MIDDLE TEXT --------------------
const onChartReady = (chart) => {
  // SET INITIAL CENTER TEXT
  chart.setOption({
    graphic: {
      id: "centerText",
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: `Total\n${total}`,
        textAlign: "center",
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 28,
      },
    },
  });

  // HOVER LOGIC
  const onOver = (params) => {
    if (params.seriesType !== "pie") return;
    const percent = ((params.value / total) * 100).toFixed(1);

    chart.setOption({
      graphic: {
        id: "centerText",
        type: "text",
        left: "center",
        top: "middle",
        style: {
          text: `${params.name}\n${percent}%`,
          textAlign: "center",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 28,
        },
      },
    });
  };

  const onOut = () => {
    chart.setOption({
      graphic: {
        id: "centerText",
        type: "text",
        left: "center",
        top: "middle",
        style: {
          text: `Total\n${total}`,
          textAlign: "center",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 28,
        },
      },
    });
  };

  chart.on("mouseover", onOver);
  chart.on("mouseout", onOut);
};


useEffect(() => {
  const chart = chartRef.current?.getEchartsInstance();
  if (!chart) return;

  setTimeout(() => {
    chart.resize();
  }, 50);
}, []);



  // -------------------- UI --------------------
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* LEFT CARD */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-normal">Recent Transactions</CardTitle>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acct) => (
                <SelectItem key={acct.id} value={acct.id}>
                  {acct.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No Recent Transactions
              </p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {tx.description || "Untitled Transaction"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(tx.date), "PP")}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex items-center",
                      tx.type === "EXPENSE" ? "text-red-500" : "text-green-500"
                    )}
                  >
                    {tx.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    )}
                    ${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT CARD — PIE CHART */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground">No Expenses this Month</p>
          ) : (
            <div style={{ height: "300px" }}>
              <ReactECharts
                ref={chartRef}
                option={option}
                style={{ height: "100%" }}
                onChartReady={onChartReady}
                />

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
