import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ShieldCheck, Star, Calendar, Package, Sprout, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_EMOJI: Record<string, string> = {
  Cattle: "🐄", Goats: "🐐", Sheep: "🐑", Poultry: "🐔",
  Crops: "🌾", Vegetables: "🥦", "Seeds & Inputs": "🌱",
  Equipment: "🚜", Processed: "🥩",
};

function FarmScoreBadge({ score }: { score: string | number | null | undefined }) {
  if (!score) return null;
  const n = Number(score);
  const tier = n >= 780 ? { label: "Gold", cls: "bg-amber-50 border-amber-300 text-amber-800" }
             : n >= 680 ? { label: "Silver", cls: "bg-slate-50 border-slate-300 text-slate-700" }
             :            { label: "Bronze", cls: "bg-orange-50 border-orange-300 text-orange-700" };
  return (
    <div className={cn("border rounded-xl p-4 text-center min-w-[130px]", tier.cls)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 opacity-70">FarmScore</p>
      <p className="text-3xl font-bold leading-none">{n}</p>
      <p className="text-[11px] font-medium mt-1 opacity-80">{tier.label} Seller</p>
    </div>
  );
}

type FarmerProfile = {
  id: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  farmName: string | null;
  farmSizeHa: string | null;
  crops: string | null;
  isVerified: boolean;
  farmScoreRating: string | null;
  totalSales: number;
  createdAt: string;
  activeListings: number;
  recentListings: Array<{
    id: number;
    title: string;
    category: string;
    price: string;
    unit: string;
    grade: string | null;
    isFeatured: boolean;
    region: string | null;
  }>;
};

export default function FarmerProfile() {
  const { id } = useParams<{ id: string }>();
  const farmerId = parseInt(id || "0", 10);

  const { data: farmer, isLoading, isError } = useQuery<FarmerProfile>({
    queryKey: ["farmer-profile", farmerId],
    queryFn: async () => {
      const res = await fetch(`/api/farmers/${farmerId}`);
      if (!res.ok) throw new Error("Farmer not found");
      return res.json();
    },
    enabled: !!farmerId && !isNaN(farmerId),
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Marketplace
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="md:col-span-2 h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        ) : isError || !farmer ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">Farmer profile not found</p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Hero card */}
            <Card className="overflow-hidden border shadow-sm">
              <div className="h-28 bg-gradient-to-r from-[#1A6B3A]/10 via-[#1A6B3A]/5 to-[#F5A623]/10" />
              <div className="px-6 sm:px-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
                  <div className="flex items-end gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-background bg-[#1A6B3A]/10 flex items-center justify-center shrink-0 shadow-sm">
                      {farmer.avatarUrl ? (
                        <img src={farmer.avatarUrl} alt={farmer.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-3xl font-bold text-[#1A6B3A]">{farmer.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="pb-1">
                      <h1 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2 flex-wrap">
                        {farmer.name}
                        {farmer.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                        {farmer.farmName && <span className="font-medium text-foreground">{farmer.farmName}</span>}
                        {farmer.region && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#F5A623]" />
                            {farmer.region}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Joined {new Date(farmer.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    <FarmScoreBadge score={farmer.farmScoreRating} />
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: farm details */}
              <div className="md:col-span-2 space-y-6">
                {farmer.bio && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">About</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{farmer.bio}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Farm Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {farmer.farmSizeHa && (
                      <div className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                        <span className="text-muted-foreground">Farm Size</span>
                        <span className="font-semibold">{Number(farmer.farmSizeHa).toLocaleString()} ha</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">Active Listings</span>
                      <span className="font-semibold">{farmer.activeListings}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-semibold">{farmer.totalSales}</span>
                    </div>
                    {farmer.crops && (
                      <div className="pt-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Crops & Produce</p>
                        <div className="flex flex-wrap gap-1.5">
                          {farmer.crops.split(",").map((c) => (
                            <Badge key={c} variant="secondary" className="text-xs">
                              <Sprout className="h-2.5 w-2.5 mr-1 text-[#1A6B3A]" />
                              {c.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Active listings */}
                {farmer.recentListings.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Active Listings</CardTitle>
                      {farmer.activeListings > 6 && (
                        <Link href={`/marketplace`} className="text-xs text-[#1A6B3A] hover:underline">
                          View all {farmer.activeListings}
                        </Link>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {farmer.recentListings.map((listing) => (
                          <Link
                            key={listing.id}
                            href={`/marketplace/${listing.id}`}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-transparent hover:border-[#1A6B3A]/20 hover:bg-[#1A6B3A]/5 transition-all group"
                          >
                            <span className="text-xl shrink-0">{CATEGORY_EMOJI[listing.category] ?? "📦"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-[#1A6B3A] transition-colors">
                                {listing.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{listing.category}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-[#1A6B3A]">
                                NAD {Number(listing.price).toLocaleString("en-NA", {
                                  minimumFractionDigits: Number(listing.price) % 1 !== 0 ? 2 : 0,
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">/ {listing.unit}</p>
                            </div>
                            {listing.grade && (
                              <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0",
                                listing.grade === "A" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                                listing.grade === "B+" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                "bg-yellow-100 text-yellow-800 border-yellow-200"
                              )}>
                                {listing.grade}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Contact Seller</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Connect with {farmer.name.split(" ")[0]} through AgriTRUST's secure negotiation platform.
                    </p>
                    <Button asChild className="w-full bg-[#1A6B3A] hover:bg-[#1A6B3A]/90 text-white">
                      <Link href="/dealwise">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Seller
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full border-[#1A6B3A]/30 text-[#1A6B3A] hover:bg-[#1A6B3A]/5">
                      <Link href="/marketplace">
                        <Package className="h-4 w-4 mr-2" />
                        Browse All Listings
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-[#F5A623] fill-[#F5A623]" />
                      <span className="font-medium">Trust Indicators</span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {farmer.isVerified && (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>Identity verified by AgriTRUST</span>
                        </div>
                      )}
                      {farmer.activeListings > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-[#1A6B3A] shrink-0" />
                          <span>{farmer.activeListings} active listing{farmer.activeListings !== 1 ? "s" : ""} on platform</span>
                        </div>
                      )}
                      {farmer.farmScoreRating && Number(farmer.farmScoreRating) >= 680 && (
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-[#F5A623] shrink-0" />
                          <span>High FarmScore — trusted seller</span>
                        </div>
                      )}
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
