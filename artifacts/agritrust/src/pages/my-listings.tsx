import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useDeleteListing, getListListingsQueryKey, type Listing } from "@workspace/api-client-react";
import { ListingFormModal } from "@/components/listing-form-modal";
import { Plus, Pencil, Trash2, MapPin, PackageOpen } from "lucide-react";
import { useEffect } from "react";
import { GradientHeading } from "@/components/ui/gradient-heading";

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

export default function MyListings() {
  const [, setLocation] = useLocation();
  const { user, token, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !token) setLocation("/login");
  }, [token, authLoading, setLocation]);

  const { data: listings, isLoading, error } = useQuery<Listing[]>({
    queryKey: ["my-listings"],
    queryFn: () =>
      fetch("/api/marketplace/my-listings?all=1", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<Listing[]>;
        }),
    enabled: !!token,
  });

  const deleteMutation = useDeleteListing({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["my-listings"] });
        qc.invalidateQueries({ queryKey: getListListingsQueryKey() });
        setDeleteConfirm(null);
      },
    },
  });

  function openCreate() {
    setEditListing(undefined);
    setModalOpen(true);
  }

  function openEdit(l: Listing) {
    setEditListing(l);
    setModalOpen(true);
  }

  function handleDelete(id: number) {
    deleteMutation.mutate({ id });
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <GradientHeading>My Listings</GradientHeading>
            <p className="text-muted-foreground mt-1">
              Manage your marketplace listings — create, edit or remove them.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="text-white shrink-0"
            style={{ backgroundColor: "#2C5F2D" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Listing
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">
            Failed to load listings. Please try again.
          </div>
        ) : !listings?.length ? (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4">
            <PackageOpen className="h-16 w-16 text-gray-300" />
            <p className="text-xl font-semibold text-gray-700">No listings yet</p>
            <p className="text-gray-500 text-sm max-w-xs">
              Post your first listing to start selling on the AgriTRUST marketplace.
            </p>
            <Button
              onClick={openCreate}
              className="mt-2 text-white"
              style={{ backgroundColor: "#2C5F2D" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((l) => (
              <div
                key={l.id}
                className="rounded-xl border bg-white overflow-hidden flex flex-col"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
              >
                <div className="relative overflow-hidden" style={{ height: "160px" }}>
                  <img
                    src={fallbackImage(l.category, l.imageUrl)}
                    alt={l.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/marketplace/maize-white.png";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 pointer-events-none"
                    style={{ height: "35%", background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
                  />
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                      {l.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {l.status === "active" ? "Active" : l.status}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4 flex flex-col gap-2">
                  <p className="font-bold text-gray-900 leading-snug" style={{ fontSize: "15px" }}>
                    {l.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {l.region && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-orange-400" />
                        {l.region}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <span className="font-bold text-[#2C5F2D]" style={{ fontSize: "16px" }}>
                      NAD {Number(l.price).toLocaleString("en-NA")}
                      <span className="text-gray-400 text-xs font-normal ml-1">/{l.unit}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {Number(l.quantity).toLocaleString()} {l.unit} avail.
                    </span>
                  </div>

                  <div className="flex gap-2 mt-auto pt-3 border-t">
                    <button
                      onClick={() => openEdit(l)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D]/5 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {deleteConfirm === l.id ? (
                      <div className="flex-1 flex gap-1">
                        <button
                          onClick={() => handleDelete(l.id)}
                          disabled={deleteMutation.isPending}
                          className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? "…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(l.id)}
                        className="px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ListingFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditListing(undefined); }}
        listing={editListing}
        onSuccess={() => {
          setModalOpen(false);
          setEditListing(undefined);
        }}
      />
    </DashboardLayout>
  );
}
