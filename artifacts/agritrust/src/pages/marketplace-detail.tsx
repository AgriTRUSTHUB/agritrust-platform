import { useState, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, BadgeCheck, Leaf, Star, ChevronRight, Scale,
  Package, Tag, ShieldCheck, Eye, Loader2, X, Award,
} from "lucide-react";
import { useGetListing, useCreateNegotiation, getGetListingQueryKey } from "@workspace/api-client-react";
import { MARKETPLACE_LISTINGS } from "@/data/marketplace-listings";

// ── Namibia regions — approximate [x,y] in a 200×250 viewBox ─────
const REGION_COORDS: Record<string, [number, number]> = {
  "Kunene":        [30,  40],
  "Omusati":       [65,  35],
  "Ohangwena":     [105, 30],
  "Kavango West":  [120, 48],
  "Kavango East":  [145, 50],
  "Zambezi":       [175, 60],
  "Oshana":        [80,  42],
  "Oshikoto":      [100, 60],
  "Otjozondjupa":  [110, 95],
  "Erongo":        [40,  100],
  "Khomas":        [85,  120],
  "Omaheke":       [140, 110],
  "Hardap":        [80,  160],
  "Karas":         [100, 210],
};

// Deterministic FarmScore (70–98) from seller name — consistent per seller
function farmScore(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return 70 + (h % 29);
}

// ── Unified display shape ────────────────────────────────────────
interface DisplayListing {
  id: number;
  title: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  availableQty: number;
  imageUrl: string | null;
  region: string;
  grade: string | null;
  certifications: string[];
  isFeatured: boolean;
  organic: boolean;
  sellerName: string;
  sellerRating: number | null;
  sellerId: number | null;
  fromDb: boolean;
}

function normalize(raw: unknown, staticId: number): DisplayListing | null {
  // Try to cast as DB listing response
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (typeof r.title === "string") {
      return {
        id: typeof r.id === "number" ? r.id : staticId,
        title: r.title,
        description: typeof r.description === "string" ? r.description : null,
        category: typeof r.category === "string" ? r.category : "",
        price: Number(r.price ?? 0),
        unit: typeof r.unit === "string" ? r.unit : "",
        quantity: Number(r.quantity ?? 0),
        availableQty: Number(r.availableQty ?? r.quantity ?? 0),
        imageUrl: typeof r.imageUrl === "string" ? r.imageUrl : null,
        region: typeof r.region === "string" ? r.region : "Namibia",
        grade: typeof r.grade === "string" ? r.grade : null,
        certifications: typeof r.certifications === "string"
          ? r.certifications.split(",").map(c => c.trim()).filter(Boolean)
          : [],
        isFeatured: typeof r.isFeatured === "boolean" ? r.isFeatured : false,
        organic: false,
        sellerName: typeof r.sellerName === "string" ? r.sellerName : "Unknown Seller",
        sellerRating: typeof r.sellerRating === "number" ? r.sellerRating : null,
        sellerId: typeof r.sellerId === "number" ? r.sellerId : null,
        fromDb: true,
      };
    }
  }
  return null;
}

function fromStatic(id: number): DisplayListing | null {
  const s = MARKETPLACE_LISTINGS.find(l => l.id === id);
  if (!s) return null;
  return {
    id: s.id,
    title: s.name,
    description: null,
    category: s.category,
    price: s.price,
    unit: s.unit,
    quantity: s.quantity,
    availableQty: s.quantity,
    imageUrl: s.image,
    region: s.region,
    grade: null,
    certifications: s.organic ? ["Organic Certified"] : [],
    isFeatured: s.featured,
    organic: s.organic,
    sellerName: s.seller,
    sellerRating: farmScore(s.seller),
    sellerId: null,
    fromDb: false,
  };
}

// ── Schematic Namibia map stub ────────────────────────────────────
function RegionMap({ region }: { region: string }) {
  const coords = REGION_COORDS[region] ?? [100, 120];
  return (
    <div className="rounded-xl border bg-[#f6faf4] overflow-hidden" style={{ height: "180px" }}>
      <div className="flex items-start justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-semibold text-[#2C5F2D] uppercase tracking-wider">Location</span>
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-orange-400" />{region}, Namibia
        </span>
      </div>
      <svg viewBox="0 0 200 250" className="w-full h-full px-4 pb-3" style={{ maxHeight: "145px" }}>
        {/* Simplified Namibia outline */}
        <path
          d="M 20 20 L 170 20 L 185 55 L 185 70 L 175 80 L 178 100 L 170 130 L 160 180 L 140 230 L 80 235 L 50 220 L 30 190 L 20 160 L 15 120 L 18 80 Z"
          fill="#e8f5e0"
          stroke="#97BC62"
          strokeWidth="1.5"
        />
        {/* Region dots — all regions */}
        {Object.entries(REGION_COORDS).map(([name, [x, y]]) => (
          <circle
            key={name}
            cx={x}
            cy={y}
            r={name === region ? 5.5 : 2.5}
            fill={name === region ? "#2C5F2D" : "#97BC62"}
            stroke={name === region ? "#fff" : "none"}
            strokeWidth="1.5"
            opacity={name === region ? 1 : 0.6}
          />
        ))}
        {/* Region label */}
        <text x={coords[0]} y={coords[1] - 9} textAnchor="middle" fontSize="8" fill="#2C5F2D" fontWeight="600">
          {region}
        </text>
      </svg>
    </div>
  );
}

// ── Seller card ───────────────────────────────────────────────────
function SellerCard({ listing }: { listing: DisplayListing }) {
  const score = listing.sellerRating ?? farmScore(listing.sellerName);
  const initial = listing.sellerName.charAt(0).toUpperCase();
  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Seller</h3>
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ backgroundColor: "#2C5F2D" }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{listing.sellerName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
            {listing.region && (
              <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />{listing.region}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FarmScore */}
      <div className="rounded-lg bg-[#f6faf4] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">FarmScore</p>
          <p className="text-2xl font-bold text-[#2C5F2D]">{score}<span className="text-sm font-normal text-gray-400">/100</span></p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                style={{ color: i <= Math.round(score / 20) ? "#97BC62" : "#d1d5db", fill: i <= Math.round(score / 20) ? "#97BC62" : "none" }}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">Platform score</span>
        </div>
      </div>

      {listing.fromDb && listing.sellerId && (
        <Link href={`/profile/${listing.sellerId}`}>
          <button
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D]/5 transition-colors"
          >
            View Seller Profile
          </button>
        </Link>
      )}
    </div>
  );
}

// ── Offer / Negotiation form ──────────────────────────────────────
function OfferForm({ listing }: { listing: DisplayListing }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [offerPrice, setOfferPrice] = useState(String(listing.price));
  const [offerQty, setOfferQty] = useState("1");
  const createNegotiation = useCreateNegotiation();

  const handleSubmit = () => {
    const price = parseFloat(offerPrice);
    const qty = parseInt(offerQty, 10);
    if (!price || !qty || price <= 0 || qty <= 0) {
      toast({ title: "Please enter a valid price and quantity.", variant: "destructive" });
      return;
    }

    if (listing.fromDb) {
      // DB listing — create negotiation server-side then go to DealWise
      createNegotiation.mutate(
        { data: { listingId: listing.id, offeredPrice: price, quantity: qty } },
        {
          onSuccess: () => {
            toast({ title: "Negotiation opened!", description: "DealWise AI is analysing your offer." });
            navigate("/dealwise");
          },
          onError: () => {
            toast({ title: "Could not open negotiation.", variant: "destructive" });
          },
        }
      );
    } else {
      // Static listing — pass prefill context to DealWise via query params
      const params = new URLSearchParams({
        listingId: String(listing.id),
        title: listing.title,
        price: String(price),
        qty: String(qty),
        unit: listing.unit,
        seller: listing.sellerName,
        region: listing.region,
        category: listing.category,
      });
      navigate(`/dealwise?${params.toString()}`);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-[#2C5F2D]" />
        <h3 className="text-sm font-semibold text-gray-900">Open Negotiation via DealWise</h3>
      </div>

      <div className="text-xs text-gray-500 bg-[#f6faf4] rounded-lg px-3 py-2">
        Asking: <span className="font-semibold text-[#2C5F2D]">NAD {listing.price.toLocaleString()}</span>/{listing.unit}
        <span className="mx-2">·</span>
        Available: <span className="font-semibold">{listing.availableQty.toLocaleString()} {listing.unit}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Your Offer (NAD)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={offerPrice}
            onChange={e => setOfferPrice(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity ({listing.unit})</label>
          <Input
            type="number"
            min="1"
            value={offerQty}
            onChange={e => setOfferQty(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={createNegotiation.isPending}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "#2C5F2D" }}
      >
        {createNegotiation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Open Negotiation
      </button>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-2 space-y-5">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function MarketplaceDetail() {
  const { id } = useParams<{ id: string }>();
  const listingId = parseInt(id ?? "0", 10);

  const { data: apiData, isLoading } = useGetListing(listingId, {
    query: {
      queryKey: getGetListingQueryKey(listingId),
      enabled: !!listingId,
      retry: false,
    },
  });

  const listing: DisplayListing | null = useMemo(() => {
    if (isLoading) return null;
    const fromApi = normalize(apiData, listingId);
    if (fromApi) return fromApi;
    // Fall back to static data only when API returns nothing (e.g. legacy ID)
    return fromStatic(listingId);
  }, [apiData, isLoading, listingId]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/marketplace" className="hover:text-[#2C5F2D] transition-colors">Marketplace</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {isLoading ? "Loading…" : (listing?.title ?? "Listing")}
          </span>
        </nav>

        {isLoading ? (
          <DetailSkeleton />
        ) : !listing ? (
          <div className="py-24 flex flex-col items-center gap-4 text-center">
            <X className="h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700">Listing not found</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              This listing may have been removed or the link is incorrect.
            </p>
            <Link href="/marketplace">
              <button className="mt-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D]/5 transition-colors">
                Back to Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left column ───────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Hero image */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100" style={{ height: "320px" }}>
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No image available
                  </div>
                )}
                {/* Dark gradient */}
                <div
                  className="absolute inset-x-0 bottom-0 pointer-events-none"
                  style={{ height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                />
                {/* Badges overlay */}
                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
                    {listing.category}
                  </span>
                  {listing.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                {listing.grade && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#2C5F2D]">
                      <Award className="h-3.5 w-3.5" /> Grade {listing.grade}
                    </span>
                  </div>
                )}
                {listing.organic && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-600 text-white">
                      🌿 Organic
                    </span>
                  </div>
                )}
              </div>

              {/* Title + meta */}
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-400" />{listing.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />{listing.sellerName}
                  </span>
                  {listing.isFeatured && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-yellow-500" /> Featured listing
                    </span>
                  )}
                </div>

                {/* Certification badges */}
                {listing.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {listing.certifications.map(cert => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700"
                      >
                        <Leaf className="h-3 w-3" /> {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {listing.description ||
                    `This listing is for ${listing.title} from ${listing.region}, Namibia. Contact the seller for full specifications and availability details.`}
                </p>
              </div>

              {/* Specifications table */}
              <div className="rounded-xl border bg-white overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Specifications</h2>
                </div>
                <div className="divide-y text-sm">
                  {[
                    { icon: Tag, label: "Category", value: listing.category },
                    { icon: MapPin, label: "Region", value: `${listing.region}, Namibia` },
                    { icon: Package, label: "Available Qty", value: `${listing.availableQty.toLocaleString()} ${listing.unit}` },
                    { icon: Package, label: "Total Listed", value: `${listing.quantity.toLocaleString()} ${listing.unit}` },
                    ...(listing.grade ? [{ icon: Award, label: "Grade", value: `Grade ${listing.grade}` }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />{label}
                      </span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region map stub */}
              <RegionMap region={listing.region} />
            </div>

            {/* ── Right column ──────────────────────────────────── */}
            <div className="space-y-5">

              {/* Price card */}
              <div className="rounded-xl border bg-white p-5">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Asking price</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#2C5F2D]">
                    NAD {listing.price >= 1000
                      ? listing.price.toLocaleString("en-NA")
                      : listing.price % 1 !== 0 ? listing.price.toFixed(2) : listing.price}
                  </span>
                  <span className="text-gray-400 text-sm">/ {listing.unit}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {listing.availableQty.toLocaleString()} {listing.unit} available
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Min. order</span>
                  <span className="font-medium">1 {listing.unit}</span>
                </div>
              </div>

              {/* Offer / Enquiry form */}
              <OfferForm listing={listing} />

              {/* Seller card */}
              <SellerCard listing={listing} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
