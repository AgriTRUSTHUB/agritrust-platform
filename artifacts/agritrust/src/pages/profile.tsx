import { useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ShieldCheck, Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || "0", 10);
  const { data: profile, isLoading } = useGetUser(userId, { query: { queryKey: getGetUserQueryKey(userId), enabled: !!userId } });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {isLoading ? (
           <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
           </div>
        ) : !profile ? (
           <div className="text-center py-12 text-muted-foreground">Profile not found.</div>
        ) : (
           <>
              <Card className="overflow-hidden border-none shadow-md">
                 <div className="h-32 bg-primary/10"></div>
                 <div className="px-6 sm:px-10 relative">
                    <div className="absolute -top-16 w-32 h-32 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center">
                       {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                       ) : (
                          <span className="text-4xl font-bold text-muted-foreground">{profile.name.charAt(0)}</span>
                       )}
                    </div>
                    <div className="pt-20 pb-8">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                             <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                {profile.name}
                                {profile.isVerified && <ShieldCheck className="h-6 w-6 text-blue-500" />}
                             </h1>
                             <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="capitalize font-medium text-foreground bg-muted px-2 py-0.5 rounded">{profile.role.replace('_', ' ')}</span>
                                {profile.region && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.region}</span>}
                                {profile.memberSince && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(profile.memberSince).getFullYear()}</span>}
                             </div>
                          </div>
                          {profile.farmScoreRating && (
                             <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center min-w-[120px]">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">FarmScore</p>
                                <p className="text-2xl font-bold text-primary">{profile.farmScoreRating}</p>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-6">
                    <Card>
                       <CardHeader><CardTitle>About</CardTitle></CardHeader>
                       <CardContent>
                          <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || "No bio provided."}</p>
                       </CardContent>
                    </Card>
                    {(profile.farmName || profile.crops) && (
                       <Card>
                          <CardHeader><CardTitle>Farm Details</CardTitle></CardHeader>
                          <CardContent className="grid grid-cols-2 gap-6">
                             {profile.farmName && (
                                <div>
                                   <p className="text-sm font-medium text-muted-foreground">Farm Name</p>
                                   <p className="font-medium mt-1">{profile.farmName}</p>
                                </div>
                             )}
                             {profile.farmSizeHa && (
                                <div>
                                   <p className="text-sm font-medium text-muted-foreground">Size</p>
                                   <p className="font-medium mt-1">{profile.farmSizeHa} Hectares</p>
                                </div>
                             )}
                             {profile.crops && (
                                <div className="col-span-2">
                                   <p className="text-sm font-medium text-muted-foreground mb-2">Primary Crops/Produce</p>
                                   <div className="flex flex-wrap gap-2">
                                      {profile.crops.split(',').map(c => (
                                         <Badge key={c} variant="secondary">{c.trim()}</Badge>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </CardContent>
                       </Card>
                    )}
                 </div>
                 <div className="space-y-6">
                    <Card>
                       <CardHeader><CardTitle>Platform Stats</CardTitle></CardHeader>
                       <CardContent className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b">
                             <span className="text-muted-foreground text-sm">Active Listings</span>
                             <span className="font-bold">{profile.totalListings || 0}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                             <span className="text-muted-foreground text-sm">Total Sales</span>
                             <span className="font-bold">{profile.totalSales || 0}</span>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
              </div>
           </>
        )}
      </div>
    </DashboardLayout>
  );
}