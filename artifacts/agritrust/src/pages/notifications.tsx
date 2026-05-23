import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Info, AlertTriangle, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'success': return <ShieldCheck className="h-5 w-5 text-primary" />;
      default: return <Info className="h-5 w-5 text-[#2196F3]" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <GradientHeading>Notifications</GradientHeading>
            <p className="text-muted-foreground mt-1">Stay updated on your account activity.</p>
          </div>
          <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
             <Check className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        </div>

        <Card>
           <CardContent className="p-0 divide-y">
              {isLoading ? (
                 <div className="p-6 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                 </div>
              ) : notifications?.length === 0 ? (
                 <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p>You're all caught up!</p>
                 </div>
              ) : (
                 notifications?.map(notif => (
                    <div key={notif.id} className={`p-4 md:p-6 flex gap-4 ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                       <div className="shrink-0 mt-1">
                          {getIcon(notif.type)}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                             <h4 className={`text-base ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>{notif.title}</h4>
                             <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                {new Date(notif.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          {notif.linkUrl && (
                             <Button variant="link" className="p-0 h-auto text-sm mt-2">View details</Button>
                          )}
                       </div>
                    </div>
                 ))
              )}
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}