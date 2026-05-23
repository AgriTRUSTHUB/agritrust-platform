import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, BadgeCheck, Leaf, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketplaceImages } from "@/hooks/use-marketplace-images";
import { useAuth } from "@/contexts/auth-context";
import { useListListings, getListListingsQueryKey, type Listing } from "@workspace/api-client-react";
import { ListingFormModal } from "@/components/listing-form-modal";
import { GradientHeading } from "@/components/ui/gradient-heading";

// ── Constants ────────────────────────────────────────────────────
const PAGE_SIZE = 20;

type Category =
  | "Cattle" | "Goats" | "Sheep" | "Poultry"
  | "Crops" | "Vegetables" | "Processed" | "Seeds & Inputs" | "Equipment";

type SortOption = "newest" | "price-asc" | "price-desc" | "qty-desc" | "organic";

const CATEGORIES: { key: "all" | Category; label: string }[] = [
  { key: "all",           label: "All" },
  { key: "Cattle",        label: "Cattle" },
  { key: "Goats",         label: "Goats" },
  { key: "Sheep",         label: "Sheep" },
  { key: "Poultry",       label: "Poultry" },
  { key: "Crops",         label: "Crops" },
  { key: "Vegetables",    label: "Vegetables" },
  { key: "Processed",     label: "Processed" },
  { key: "Seeds & Inputs",label: "Seeds & Inputs" },
  { key: "Equipment",     label: "Equipment" },
];

const CATEGORY_FALLBACK: Record<string, string> = {
  "Cattle":        "/marketplace/brahman-bull.png",
  "Goats":         "/marketplace/boer-goats.png",
  "Sheep":         "/marketplace/dorper-sheep.png",
  "Poultry":       "/marketplace/chickens.png",
  "Crops":         "/marketplace/maize-white.png",
  "Vegetables":    "/marketplace/vegetables-mixed.png",
  "Processed":     "/marketplace/biltong.png",
  "Seeds & Inputs":"/marketplace/compost.png",
  "Equipment":     "/marketplace/hay-bales.png",
};

function categoryImage(category: string, imageUrl?: string | null): string {
  if (imageUrl) return imageUrl;
  return CATEGORY_FALLBACK[category] ?? "/marketplace/maize-white.png";
}

// ── Unified display type ────────────────────────────────────────
interface DisplayListing {
  id: number;
  name: string;
  category: Category;
  price: number;
  unit: string;
  quantity: number;
  quantityUnit: string;
  seller: string;
  region: string;
  organic: boolean;
  featured: boolean;
  image: string;
}

function toDisplay(l: Listing): DisplayListing {
  return {
    id: l.id,
    name: l.title,
    category: l.category as Category,
    price: Number(l.price),
    unit: l.unit,
    quantity: Number(l.quantity),
    quantityUnit: l.unit,
    seller: l.sellerName ?? "Unknown",
    region: l.region ?? "Namibia",
    organic: !!(l.certifications?.toLowerCase().includes("organic")),
    featured: l.isFeatured ?? false,
    image: categoryImage(l.category, l.imageUrl),
  };
}

// ── Listing Card ─────────────────────────────────────────────────
function ListingCard({
  listing,
  generatedSrc,
  isGenerating,
}: {
  listing: DisplayListing;
  generatedSrc?: string;
  isGenerating: boolean;
}) {
  const src = generatedSrc ?? listing.image;

  return (
    <div
      className="group rounded-xl border bg-white overflow-hidden flex flex-col transition-all duration-300"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.14)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
    >
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        <img
          src={src}
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/marketplace/maize-white.png";
          }}
        />
        {isGenerating && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-gray-200/70 via-white/50 to-gray-200/70 animate-pulse"
            style={{ backdropFilter: "blur(2px)" }}
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: "30%", background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
        />
        {listing.featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-sm">
              ⭐ Featured
            </span>
          </div>
        )}
        <div className="absolute bottom-2 left-3">
          <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
            {listing.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <p className="font-bold text-gray-900 leading-snug" style={{ fontSize: "16px" }}>
            {listing.name}
          </p>
          {listing.organic && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 mt-1">
              <Leaf className="h-3 w-3" /> Organic
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ fontSize: "13px", color: "#888" }}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            {listing.region}
          </span>
          <span className="flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
            {listing.seller}
          </span>
        </div>

        <div className="flex items-end justify-between mt-1">
          <div>
            {listing.price === 0 ? (
              <span className="font-bold text-[#2C5F2D]" style={{ fontSize: "16px" }}>Revenue Share</span>
            ) : (
              <>
                <span className="font-bold text-[#2C5F2D]" style={{ fontSize: "18px" }}>
                  NAD {listing.price >= 1000
                    ? listing.price.toLocaleString("en-NA")
                    : listing.price % 1 !== 0 ? listing.price.toFixed(2) : listing.price}
                </span>
                <span className="text-gray-400 text-xs ml-1">/{listing.unit}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-400 text-right">
            {listing.quantity.toLocaleString()} {listing.quantityUnit} avail.
          </span>
        </div>

        <div className="flex-1" />

        <Link
          href={`/marketplace/${listing.id}`}
          className="block w-full mt-2 py-2.5 rounded-lg text-sm font-semibold text-white text-center transition-colors"
          style={{ backgroundColor: "#2C5F2D" }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = "#1e4220"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.backgroundColor = "#2C5F2D"; }}
        >
          View &amp; Negotiate
        </Link>
      </div>
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-6 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "w-9 h-9 rounded-full text-sm font-semibold transition-colors",
              page === p ? "bg-[#2C5F2D] text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Skeleton grid ────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-white overflow-hidden animate-pulse">
          <div className="h-[200px] bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-8 bg-gray-100 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, token } = useAuth();

  // Fetch all active listings from the API
  const { data: listingsPage, isLoading, error } = useListListings(
    { limit: 500 },
    {
      query: {
        queryKey: getListListingsQueryKey({ limit: 500 }),
      },
    }
  );

  const allListings: DisplayListing[] = useMemo(
    () => (listingsPage?.items ?? []).map(toDisplay),
    [listingsPage]
  );

  // Category counts from live data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allListings.length };
    for (const l of allListings) {
      counts[l.category] = (counts[l.category] ?? 0) + 1;
    }
    return counts;
  }, [allListings]);

  // Filter
  const filtered = useMemo(() => {
    let items = allListings;
    if (activeCategory !== "all") {
      items = items.filter((l) => l.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.region.toLowerCase().includes(q) ||
          l.seller.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allListings, activeCategory, search]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "price-asc":  return copy.sort((a, b) => a.price - b.price);
      case "price-desc": return copy.sort((a, b) => b.price - a.price);
      case "qty-desc":   return copy.sort((a, b) => b.quantity - a.quantity);
      case "organic":    return copy.filter((l) => l.organic);
      default:           return copy.sort((a, b) => b.id - a.id);
    }
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = sorted.slice(start, start + PAGE_SIZE);

  const { images: aiImages, loading: aiLoading } = useMarketplaceImages(paginated);

  const handleCategoryChange = (key: "all" | Category) => { setActiveCategory(key); setPage(1); };
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleSort = (val: SortOption) => { setSort(val); setPage(1); };

  const showStart = sorted.length === 0 ? 0 : start + 1;
  const showEnd = Math.min(start + PAGE_SIZE, sorted.length);

  function handlePostNew() {
    if (!token) {
      setLocation("/login");
      return;
    }
    setModalOpen(true);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>Marketplace</GradientHeading>
            <p className="text-muted-foreground mt-1">
              {isLoading
                ? "Loading listings from Namibia's best farmers…"
                : `Browse ${allListings.length} listings from Namibia's best farmers and suppliers.`}
            </p>
          </div>
          <div className="flex gap-2">
            {user && (
              <Button
                variant="outline"
                style={{ borderColor: "#2C5F2D", color: "#2C5F2D" }}
                onClick={() => setLocation("/my-listings")}
              >
                My Listings
              </Button>
            )}
            <Button
              style={{ backgroundColor: "#2C5F2D" }}
              className="text-white hover:opacity-90"
              onClick={handlePostNew}
            >
              Post New Listing
            </Button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          {CATEGORIES.map(({ key, label }) => {
            const count = categoryCounts[key] ?? 0;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap"
                style={isActive
                  ? { backgroundColor: "#2C5F2D", color: "white", borderColor: "#2C5F2D" }
                  : { backgroundColor: "white", color: "#2C5F2D", borderColor: "#2C5F2D" }
                }
              >
                {label}
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={isActive
                    ? { backgroundColor: "rgba(255,255,255,0.2)", color: "white" }
                    : { backgroundColor: "#f0f4f0", color: "#2C5F2D" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Sort + Count row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by product, region, seller…"
              className="pl-9 pr-9"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => handleSearch("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isLoading && (
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Showing {showStart}–{showEnd} of {sorted.length} listings
              </span>
            )}
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value as SortOption)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C5F2D]/30"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="qty-desc">Most Available</option>
              <option value="organic">Organic Only</option>
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="py-8 text-center text-red-500 text-sm">
            Failed to load listings. Please refresh the page.
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <SkeletonGrid />
        ) : sorted.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="48" cy="48" r="44" fill="#F0F7ED" />
              <line x1="48" y1="68" x2="48" y2="30" stroke="#97BC62" strokeWidth="2.5" strokeLinecap="round"/>
              <ellipse cx="48" cy="30" rx="5" ry="8" fill="#97BC62" opacity="0.9"/>
              <ellipse cx="42" cy="38" rx="4" ry="7" fill="#97BC62" opacity="0.75" transform="rotate(-20 42 38)"/>
              <ellipse cx="54" cy="38" rx="4" ry="7" fill="#97BC62" opacity="0.75" transform="rotate(20 54 38)"/>
              <ellipse cx="40" cy="47" rx="4" ry="7" fill="#97BC62" opacity="0.55" transform="rotate(-25 40 47)"/>
              <ellipse cx="56" cy="47" rx="4" ry="7" fill="#97BC62" opacity="0.55" transform="rotate(25 56 47)"/>
              <circle cx="62" cy="62" r="12" stroke="#2C5F2D" strokeWidth="2.5" fill="white" fillOpacity="0.9"/>
              <line x1="70.5" y1="70.5" x2="78" y2="78" stroke="#2C5F2D" strokeWidth="3" strokeLinecap="round"/>
              <line x1="57" y1="62" x2="67" y2="62" stroke="#2C5F2D" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
              <line x1="62" y1="57" x2="62" y2="67" stroke="#2C5F2D" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
            </svg>
            <p className="text-xl font-semibold text-gray-700">No listings found</p>
            <p className="text-gray-500 text-sm max-w-xs">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              onClick={() => { handleSearch(""); handleCategoryChange("all"); }}
              className="mt-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D]/5 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginated.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                generatedSrc={aiImages[listing.id]}
                isGenerating={aiLoading.has(listing.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      </div>

      <ListingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </DashboardLayout>
  );
}
