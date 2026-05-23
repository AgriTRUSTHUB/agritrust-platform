import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetFarmScore } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Activity, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function FarmScorePage() {
  const { data: score, isLoading } = useGetFarmScore();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <GradientHeading>FarmScore Profile</GradientHeading>
          <p className="text-muted-foreground mt-1">Your agricultural credit and reliability score.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-primary-foreground border-none md:col-span-1">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-primary-foreground/80 text-sm uppercase tracking-wider">Current Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              {isLoading ? <Skeleton className="h-24 w-32 mx-auto bg-primary-foreground/20" /> : (
                <>
                  <div className="text-7xl font-bold mb-4">{score?.score || "N/A"}</div>
                  <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1 text-sm">
                    {score?.tier || "Unrated"} Tier
                  </Badge>
                  <p className="text-xs text-primary-foreground/60 mt-6">Last updated: {score?.lastUpdated ? new Date(score.lastUpdated).toLocaleDateString() : 'Recently'}</p>
                </>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                   <CardTitle>Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   {isLoading ? (
                      <div className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
                   ) : (
                      <>
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="font-medium">Sales History</span>
                              <span className="text-muted-foreground">{score?.salesHistory}/100</span>
                           </div>
                           <Progress value={score?.salesHistory || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="font-medium">Payment Reliability</span>
                              <span className="text-muted-foreground">{score?.paymentHistory}/100</span>
                           </div>
                           <Progress value={score?.paymentHistory || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="font-medium">Community Reputation</span>
                              <span className="text-muted-foreground">{score?.communityReputation}/100</span>
                           </div>
                           <Progress value={score?.communityReputation || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="font-medium">Sustainability Practices</span>
                              <span className="text-muted-foreground">{score?.sustainabilityScore}/100</span>
                           </div>
                           <Progress value={score?.sustainabilityScore || 0} className="h-2" />
                        </div>
                      </>
                   )}
                </CardContent>
             </Card>
          </div>
        </div>

        <Card>
           <CardHeader>
              <CardTitle>How to Improve Your Score</CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg border">
                 <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                 <div>
                    <h4 className="font-medium mb-1">Complete your profile</h4>
                    <p className="text-sm text-muted-foreground">Add certifications and verify your identity to instantly boost your trust rating.</p>
                 </div>
              </div>
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg border">
                 <Activity className="h-5 w-5 text-[#2196F3] shrink-0" />
                 <div>
                    <h4 className="font-medium mb-1">Log impact activities</h4>
                    <p className="text-sm text-muted-foreground">Record your sustainable farming practices in ImpactLedger.</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}