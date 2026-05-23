import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useGetUserDashboardSummary, useGetActivityFeed, getGetUserDashboardSummaryQueryKey, getGetActivityFeedQueryKey, type Listing } from "@workspace/api-client-react";
import { Store, TrendingUp, AlertCircle, ShoppingBag, ArrowUpRight, ScanSearch, Scale, Sprout, ChevronRight, Eye, PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_FALLBACK: Record<string, string> = {
  "Cattle":         "/marketplace/brahman-bull.png",
  "Goats":          "/marketplace/boer-goats.png",
  "Sheep":          "/marketplace/dorper-sheep.png",
  "Poultry":        "/marketplace/chickens.png",
  "Crops":          "/marketplace/maize-white.png",
  "Vegetables":     "/marketplace/vegetables-mixed.png",
  "Processed":      "/marketplace/biltong.png",
  "Seeds & Inputs": "/marketplace/compost.png",
  "Equipment":      "/marketplace/hay-bales.png",
};

function fallbackImage(category: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  return CATEGORY_FALLBACK[category] ?? "/marketplace/maize-white.png";
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, token, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !token) {
      setLocation("/login");
    }
  }, [token, authLoading, setLocation]);

  const { data: summary, isLoading: summaryLoading } = useGetUserDashboardSummary({
    query: {
      queryKey: getGetUserDashboardSummaryQueryKey(),
      enabled: !!token,
    }
  });

  const { data: activities, isLoading: activitiesLoading } = useGetActivityFeed(
    { limit: 5 },
    {
      query: {
        queryKey: getGetActivityFeedQueryKey({ limit: 5 }),
        enabled: !!token,
      }
    }
  );

  const { data: myListings, isLoading: myListingsLoading } = useQuery<Listing[]>({
    queryKey: ["dashboard-my-listings"],
    queryFn: () =>
      fetch("/api/marketplace/my-listings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Listing[]>;
      }),
    enabled: !!token,
  });

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const topListings = myListings?.slice(0, 3) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Welcome Banner */}
        <div
          className="rounded-2xl px-7 py-6 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #2C5F2D 0%, #3a7d3b 60%, #97BC62 100%)" }}
        >
          <div>
            <p className="text-green-200 text-sm font-medium mb-1">Good day,</p>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight">{user.name}</h1>
            <p className="text-green-100 mt-1 text-[15px]">Here's what's happening with your farm today.</p>
          </div>
          <div className="hidden sm:flex">
            <Sprout className="h-16 w-16 text-white/20" />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Earnings */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[13px] font-semibold text-emerald-700 uppercase tracking-wide">Total Earnings</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold text-emerald-800">NAD {summary?.totalEarnings.toLocaleString()}</div>
              )}
              <p className="text-[12px] text-emerald-600 mt-1">Lifetime platform earnings</p>
            </CardContent>
          </Card>

          {/* Active Listings */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[13px] font-semibold text-blue-700 uppercase tracking-wide">Active Listings</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? <Skeleton className="h-8 w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-blue-800">{summary?.activeListings ?? 0}</div>
                  <Link href="/my-listings" className="text-[12px] text-blue-600 hover:underline mt-1 flex items-center gap-0.5">
                    Manage listings <ChevronRight className="h-3 w-3" />
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[13px] font-semibold text-amber-700 uppercase tracking-wide">Pending Orders</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-2xl font-bold text-amber-800">{summary?.pendingOrders}</div>
              )}
              <p className="text-[12px] text-amber-600 mt-1">Awaiting your action</p>
            </CardContent>
          </Card>

          {/* FarmScore */}
          <Card className="border-[#97BC62]/40 shadow-sm" style={{ background: "linear-gradient(135deg, #f6faf4 0%, #e8f5e0 100%)" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: "#2C5F2D" }}>FarmScore</CardTitle>
              <div className="h-10 w-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: "#2C5F2D20", borderColor: "#97BC6260" }}>
                <AlertCircle className="h-5 w-5" style={{ color: "#2C5F2D" }} />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-2xl font-bold" style={{ color: "#2C5F2D" }}>{summary?.farmScore || "N/A"}</div>
              )}
              <p className="text-[12px] mt-1" style={{ color: "#2C5F2D99" }}>Your trust rating</p>
            </CardContent>
          </Card>
        </div>

        {/* My Active Listings Summary */}
        {(myListingsLoading || (myListings && myListings.length > 0)) && (
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">My Active Listings</CardTitle>
                  <p className="text-[13px] text-muted-foreground mt-0.5">Your top listings and how they're performing</p>
                </div>
                <Link
                  href="/my-listings"
                  className="flex items-center gap-1 text-[13px] font-medium hover:underline"
                  style={{ color: "#2C5F2D" }}
                >
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {myListingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border overflow-hidden animate-pulse">
                      <div className="h-28 bg-gray-100" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <PackageOpen className="h-10 w-10 text-gray-300" />
                  <p className="text-[15px] text-muted-foreground">No active listings yet.</p>
                  <Link
                    href="/my-listings"
                    className="text-[13px] font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#2C5F2D" }}
                  >
                    Post your first listing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topListings.map((listing) => (
                    <Link key={listing.id} href={`/marketplace/${listing.id}`}>
                      <div className="rounded-xl border overflow-hidden hover:shadow-md transition-all cursor-pointer group bg-white">
                        {/* Thumbnail */}
                        <div className="relative h-28 overflow-hidden bg-gray-100">
                          <img
                            src={fallbackImage(listing.category, listing.imageUrl)}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/marketplace/maize-white.png";
                            }}
                          />
                          {/* gradient overlay */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }}
                          />
                          <div className="absolute bottom-2 left-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                              {listing.category}
                            </span>
                          </div>
                          {/* view count badge */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[11px] px-1.5 py-0.5 rounded-full">
                            <Eye className="h-3 w-3" />
                            {listing.viewCount ?? 0}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3">
                          <p className="text-[13px] font-semibold text-gray-900 line-clamp-1 group-hover:text-[#2C5F2D] transition-colors">
                            {listing.title}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[13px] font-bold" style={{ color: "#2C5F2D" }}>
                              NAD {Number(listing.price).toLocaleString("en-NA")}
                              <span className="text-gray-400 text-[11px] font-normal ml-0.5">/{listing.unit}</span>
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              <Eye className="h-2.5 w-2.5" />
                              {listing.viewCount ?? 0} views
                            </span>
                          </div>
                          {listing.region && (
                            <p className="text-[11px] text-gray-400 mt-1 truncate">{listing.region}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <Card className="col-span-1 lg:col-span-2 shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Last 5 events</span>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {activitiesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-1">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="flex items-start gap-4 py-3 px-2 rounded-lg hover:bg-muted/40 transition-colors">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: idx % 3 === 0 ? "#2C5F2D" : idx % 3 === 1 ? "#3b82f6" : "#f59e0b" }}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-gray-800 leading-snug">{activity.description}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                          {new Date(activity.createdAt).toLocaleDateString("en-NA", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-[15px] text-muted-foreground">No recent activity yet.</p>
                  <p className="text-[13px] text-muted-foreground">Start by posting a listing or scanning a product.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <p className="text-[13px] text-muted-foreground mt-0.5">Jump straight to key tasks</p>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <Link
                href="/my-listings"
                className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #2C5F2D, #3a7d3b)" }}
              >
                <Store className="h-5 w-5" />
                Post New Listing
              </Link>

              <a
                href="/qualityscan"
                className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl text-[15px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 transition-all hover:bg-blue-100 active:scale-[0.98]"
              >
                <ScanSearch className="h-5 w-5 text-blue-500" />
                Request QualityScan
              </a>

              <a
                href="/dealwise"
                className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl text-[15px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 transition-all hover:bg-amber-100 active:scale-[0.98]"
              >
                <Scale className="h-5 w-5 text-amber-500" />
                Review Negotiations
              </a>

              <Link
                href="/marketplace"
                className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl text-[15px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 transition-all hover:bg-gray-100 active:scale-[0.98]"
              >
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                Browse Marketplace
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
