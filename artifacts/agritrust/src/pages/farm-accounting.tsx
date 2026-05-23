import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetAccountSummary, useListTransactions } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function FarmAccounting() {
  const { data: summary, isLoading: summaryLoading } = useGetAccountSummary();
  const { data: transactions, isLoading: txLoading } = useListTransactions();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>Farm Accounting</GradientHeading>
            <p className="text-muted-foreground mt-1">Track income, expenses, and overall financial health.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="text-destructive hover:bg-destructive/10">Add Expense</Button>
             <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Add Income</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                 {summaryLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-primary">NAD {summary?.totalIncome.toLocaleString()}</div>}
              </CardContent>
           </Card>
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" /> Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                 {summaryLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-destructive">NAD {summary?.totalExpenses.toLocaleString()}</div>}
              </CardContent>
           </Card>
           <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4 text-foreground" /> Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                 {summaryLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">NAD {summary?.netProfit.toLocaleString()}</div>}
              </CardContent>
           </Card>
        </div>

        <Card>
           <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
           </CardHeader>
           <CardContent>
              {txLoading ? (
                 <div className="space-y-4"><Skeleton className="h-12 w-full" /></div>
              ) : transactions?.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
              ) : (
                 <div className="space-y-4">
                    {transactions?.map(tx => (
                       <div key={tx.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                          <div>
                             <p className="font-medium">{tx.description}</p>
                             <div className="flex gap-2 items-center mt-1">
                                <Badge variant="secondary" className="text-xs font-normal">{tx.category}</Badge>
                                <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <div className={`font-bold ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                             {tx.type === 'income' ? '+' : '-'} NAD {tx.amount.toLocaleString()}
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}