import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListDisputes } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, FileText, AlertCircle } from "lucide-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Disputes() {
  const { data: disputes, isLoading } = useListDisputes();

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>Dispute Resolution</GradientHeading>
            <p className="text-muted-foreground mt-1">Track and manage your platform disputes.</p>
          </div>
          <Button variant="outline">File New Dispute</Button>
        </div>

        <Card>
           <CardHeader>
              <CardTitle>Your Active Cases</CardTitle>
           </CardHeader>
           <CardContent className="p-0 divide-y">
              {isLoading ? (
                 <div className="p-6 space-y-4"><Skeleton className="h-20 w-full" /></div>
              ) : disputes?.length === 0 ? (
                 <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <Scale className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p>No active disputes.</p>
                 </div>
              ) : (
                 disputes?.map(dispute => (
                    <div key={dispute.id} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                       <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                             <h3 className="font-bold text-lg">{dispute.title}</h3>
                             <Badge variant={dispute.status === 'Resolved' ? 'secondary' : 'default'} className={dispute.status !== 'Resolved' ? 'bg-accent text-accent-foreground border-none' : ''}>
                                {dispute.status}
                             </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                             <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Case #{dispute.id}</span>
                             <span>Against: {dispute.respondentName}</span>
                             <span>Filed: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                       <Button variant="secondary" className="w-full md:w-auto shrink-0">View Case Details</Button>
                    </div>
                 ))
              )}
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}