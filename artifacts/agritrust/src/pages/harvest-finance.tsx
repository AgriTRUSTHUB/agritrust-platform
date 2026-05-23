import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListLoans, useGetFarmScore } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { Link } from "wouter";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function HarvestFinance() {
  const { data: loans, isLoading: loansLoading } = useListLoans();
  const { data: farmScore, isLoading: scoreLoading } = useGetFarmScore();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <GradientHeading>Harvest Finance</GradientHeading>
          <p className="text-muted-foreground mt-1">Access agricultural financing linked directly to your FarmScore.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-primary-foreground border-none md:col-span-2">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Need capital for the next season?</h2>
                <p className="text-primary-foreground/80 mb-6 max-w-md">
                  Apply for equipment, seed, or operational loans. Your FarmScore determines your interest rate—better scores mean cheaper capital.
                </p>
                <Button variant="secondary">Apply for Loan</Button>
              </div>
              <Wallet className="h-24 w-24 opacity-20 shrink-0" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" /> Your FarmScore
              </CardTitle>
            </CardHeader>
            <CardContent>
               {scoreLoading ? <Skeleton className="h-16 w-full" /> : (
                 <div className="text-center py-4">
                    <div className="text-5xl font-bold text-accent mb-2">{farmScore?.score || "N/A"}</div>
                    <Badge variant="outline" className="text-sm px-3">{farmScore?.tier || "Unrated"} Tier</Badge>
                 </div>
               )}
               <Button variant="link" className="w-full mt-2" asChild>
                  <Link href="/farmscore">View Full Breakdown <ArrowRight className="h-4 w-4 ml-1" /></Link>
               </Button>
            </CardContent>
          </Card>
        </div>

        <div>
           <h2 className="text-xl font-bold mb-4">Your Active Loans</h2>
           {loansLoading ? (
             <div className="space-y-4"><Skeleton className="h-24 w-full" /></div>
           ) : loans?.length === 0 ? (
             <Card><CardContent className="py-8 text-center text-muted-foreground">No active loans found.</CardContent></Card>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {loans?.map(loan => (
                   <Card key={loan.id}>
                      <CardHeader className="pb-2">
                         <div className="flex justify-between">
                            <Badge variant="outline">{loan.status}</Badge>
                            <span className="text-sm text-muted-foreground">{loan.term} months @ {loan.interestRate}%</span>
                         </div>
                         <CardTitle className="text-xl mt-2">NAD {loan.amount.toLocaleString()}</CardTitle>
                         <CardDescription>{loan.purpose}</CardDescription>
                      </CardHeader>
                      <CardContent>
                         <div className="w-full bg-muted rounded-full h-2 mt-4">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                         </div>
                         <p className="text-xs text-muted-foreground mt-2 text-right">Repayment Progress</p>
                      </CardContent>
                   </Card>
                ))}
             </div>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}