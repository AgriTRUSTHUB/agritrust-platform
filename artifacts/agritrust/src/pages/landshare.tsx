import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Maximize, Droplets, Leaf } from "lucide-react";
import { useListLandListings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function LandShare() {
  const { data: listings, isLoading } = useListLandListings();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>LandShare</GradientHeading>
            <p className="text-muted-foreground mt-1">Browse or post land lease opportunities across the region.</p>
          </div>
          <Button>List Your Land</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-32 w-full" /></CardHeader></Card>
             ))
           ) : listings?.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">No land listings found.</div>
           ) : (
             listings?.map(land => (
               <Card key={land.id} className="overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="h-48 bg-muted relative">
                     {land.imageUrl ? (
                        <img src={land.imageUrl} alt={land.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                     )}
                     <Badge className="absolute top-3 right-3 bg-background/80 text-foreground backdrop-blur">{land.status}</Badge>
                  </div>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-xl">{land.title}</CardTitle>
                     <div className="text-2xl font-bold text-primary mt-2">NAD {land.pricePerHaPerYear.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ ha / yr</span></div>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {land.region}
                     </div>
                     <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                           <Maximize className="h-4 w-4 text-muted-foreground" />
                           <span className="font-medium">{land.hectares} ha</span>
                        </div>
                        {land.waterAccess && (
                           <div className="flex items-center gap-2 text-blue-500">
                             <Droplets className="h-4 w-4" />
                             <span className="font-medium">Water Access</span>
                           </div>
                        )}
                        {land.soilType && (
                           <div className="flex items-center gap-2 text-accent">
                             <Leaf className="h-4 w-4" />
                             <span className="font-medium truncate">{land.soilType}</span>
                           </div>
                        )}
                     </div>
                  </CardContent>
                  <CardFooter>
                     <Button className="w-full" variant="outline">Contact Owner</Button>
                  </CardFooter>
               </Card>
             ))
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}