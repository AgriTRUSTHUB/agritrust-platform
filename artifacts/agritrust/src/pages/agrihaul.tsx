import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListShipments } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, MapPin, Package } from "lucide-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function AgriHaul() {
  const { data: shipments, isLoading } = useListShipments();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>AgriHaul Logistics</GradientHeading>
            <p className="text-muted-foreground mt-1">Book and track agricultural transport services.</p>
          </div>
          <Button className="gap-2"><Truck className="h-4 w-4" /> Book Shipment</Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
             ))
           ) : shipments?.length === 0 ? (
             <Card><CardContent className="py-12 text-center text-muted-foreground">No active shipments.</CardContent></Card>
           ) : (
             shipments?.map(shipment => (
               <Card key={shipment.id}>
                  <CardContent className="p-6">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Package className="h-6 w-6 text-primary" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-lg">{shipment.cargoType} <span className="text-muted-foreground font-normal text-sm">({shipment.weightKg} kg)</span></h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                 <Badge variant="outline">{shipment.status}</Badge>
                                 {shipment.trackingCode && <span>Tracking: {shipment.trackingCode}</span>}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm w-full md:w-auto">
                           <div className="flex-1 md:flex-none">
                              <p className="text-xs text-muted-foreground">Origin</p>
                              <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {shipment.origin}</p>
                           </div>
                           <div className="text-muted-foreground">&rarr;</div>
                           <div className="flex-1 md:flex-none">
                              <p className="text-xs text-muted-foreground">Destination</p>
                              <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {shipment.destination}</p>
                           </div>
                        </div>
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