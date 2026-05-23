import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListAlerts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, MapPin, Search } from "lucide-react";

export default function TheftAlerts() {
  const { data: alerts, isLoading } = useListAlerts();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-destructive flex items-center gap-2">
               <ShieldAlert className="h-8 w-8" /> Theft Alerts
            </h1>
            <p className="text-muted-foreground mt-1">Community watch for stolen livestock and equipment.</p>
          </div>
          <Button variant="destructive">Report Stolen Item</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-48 w-full" /></CardHeader></Card>
             ))
           ) : alerts?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">No active theft alerts in your region.</div>
           ) : (
             alerts?.map(alert => (
               <Card key={alert.id} className="overflow-hidden border-destructive/20">
                  <div className="h-48 bg-muted relative">
                     {alert.imageUrl ? (
                        <img src={alert.imageUrl} alt={alert.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-destructive/5">
                           <Search className="h-8 w-8 text-destructive/40" />
                        </div>
                     )}
                     <Badge variant="destructive" className="absolute top-3 left-3">{alert.status}</Badge>
                     {alert.rewardOffered && (
                        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-none">
                           Reward: NAD {alert.rewardOffered.toLocaleString()}
                        </Badge>
                     )}
                  </div>
                  <CardHeader className="pb-2">
                     <div className="flex justify-between items-start">
                        <CardTitle className="text-xl line-clamp-1">{alert.title}</CardTitle>
                     </div>
                     <p className="text-sm font-medium text-destructive mt-1">{alert.itemType}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                     <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" /> 
                        <span className="font-medium">{alert.region}</span>
                     </div>
                     <div className="pt-4 border-t text-xs text-muted-foreground flex justify-between">
                        <span>Reported by: {alert.reporterName}</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                     </div>
                  </CardContent>
               </Card>
             ))
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}