import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetImpactStats, useListImpactActivities } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Droplets, Sprout, Wind } from "lucide-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Impact() {
  const { data: stats, isLoading: statsLoading } = useGetImpactStats();
  const { data: activities, isLoading: actsLoading } = useListImpactActivities();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>ImpactLedger</GradientHeading>
            <p className="text-muted-foreground mt-1">Track your farm's sustainability metrics and environmental impact.</p>
          </div>
          <Button className="gap-2"><Leaf className="h-4 w-4" /> Log Activity</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card>
              <CardContent className="p-6">
                 <Leaf className="h-6 w-6 text-primary mb-3" />
                 {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.treesPlanted}</div>}
                 <p className="text-sm text-muted-foreground">Trees Planted</p>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-6">
                 <Wind className="h-6 w-6 text-[#2196F3] mb-3" />
                 {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.co2OffsetTons}</div>}
                 <p className="text-sm text-muted-foreground">CO2 Offset (Tons)</p>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-6">
                 <Droplets className="h-6 w-6 text-blue-500 mb-3" />
                 {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.waterSavedLiters}</div>}
                 <p className="text-sm text-muted-foreground">Water Saved (L)</p>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-6">
                 <Sprout className="h-6 w-6 text-accent mb-3" />
                 {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.sustainableHectares}</div>}
                 <p className="text-sm text-muted-foreground">Sustainable Hectares</p>
              </CardContent>
           </Card>
        </div>

        <Card>
           <CardHeader>
              <CardTitle>Recent Impact Activities</CardTitle>
           </CardHeader>
           <CardContent>
              {actsLoading ? (
                 <div className="space-y-4"><Skeleton className="h-16 w-full" /></div>
              ) : activities?.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">No impact activities logged yet.</div>
              ) : (
                 <div className="space-y-4">
                    {activities?.map(act => (
                       <div key={act.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                             <p className="font-medium">{act.description}</p>
                             <p className="text-sm text-muted-foreground">{new Date(act.createdAt).toLocaleDateString()} • {act.type}</p>
                          </div>
                          <div className="text-right">
                             <span className="font-bold text-primary">+{act.impactValue} {act.unit}</span>
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