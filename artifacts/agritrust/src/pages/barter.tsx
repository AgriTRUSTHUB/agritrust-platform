import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListBarterItems } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Repeat, ArrowRightLeft } from "lucide-react";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function Barter() {
  const { data: items, isLoading } = useListBarterItems();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>Barter Exchange</GradientHeading>
            <p className="text-muted-foreground mt-1">Trade goods and equipment directly with other farmers.</p>
          </div>
          <Button className="gap-2"><Repeat className="h-4 w-4" /> Post Item</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-32 w-full" /></CardHeader></Card>
             ))
           ) : items?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">No barter items found.</div>
           ) : (
             items?.map(item => (
               <Card key={item.id} className="overflow-hidden">
                  <div className="h-40 bg-muted relative">
                     {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                     )}
                     <Badge className="absolute top-3 right-3 bg-background/80 text-foreground backdrop-blur">{item.status}</Badge>
                  </div>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-xl">{item.title}</CardTitle>
                     <p className="text-sm text-muted-foreground mt-1">Offering: {item.quantity} {item.unit}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="bg-accent/10 border border-accent/20 rounded-md p-3">
                        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Looking For</p>
                        <p className="text-sm font-medium">{item.wantedFor || "Open to offers"}</p>
                     </div>
                     <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">{item.userName}</span>
                        <Button variant="ghost" size="sm" className="h-8 gap-1"><ArrowRightLeft className="h-3 w-3" /> Propose Trade</Button>
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