import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  useCreateListing,
  useUpdateListing,
  getListListingsQueryKey,
  type Listing,
} from "@workspace/api-client-react";

const CATEGORIES = [
  "Cattle",
  "Goats",
  "Sheep",
  "Poultry",
  "Crops",
  "Vegetables",
  "Processed",
  "Seeds & Inputs",
  "Equipment",
];

const UNITS = ["kg", "g", "ton", "bag", "box", "bunch", "head", "litre", "unit", "ha"];

const REGIONS = [
  "Khomas", "Erongo", "Hardap", "//Kharas", "Omaheke", "Otjozondjupa",
  "Oshikoto", "Oshana", "Ohangwena", "Omusati",
  "Kavango East", "Kavango West", "Zambezi", "Kunene",
];

interface Props {
  open: boolean;
  onClose: () => void;
  listing?: Listing;
  onSuccess?: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export function ListingFormModal({ open, onClose, listing, onSuccess }: Props) {
  const isEdit = !!listing;
  const qc = useQueryClient();

  const [title, setTitle] = useState(listing?.title ?? "");
  const [category, setCategory] = useState(listing?.category ?? "Cattle");
  const [price, setPrice] = useState(listing?.price?.toString() ?? "");
  const [unit, setUnit] = useState(listing?.unit ?? "kg");
  const [quantity, setQuantity] = useState(listing?.quantity?.toString() ?? "");
  const [region, setRegion] = useState(listing?.region ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [grade, setGrade] = useState(listing?.grade ?? "");
  const [certifications, setCertifications] = useState(listing?.certifications ?? "");
  const [imageUrl, setImageUrl] = useState(listing?.imageUrl ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (listing) {
      setTitle(listing.title ?? "");
      setCategory(listing.category ?? "Cattle");
      setPrice(listing.price?.toString() ?? "");
      setUnit(listing.unit ?? "kg");
      setQuantity(listing.quantity?.toString() ?? "");
      setRegion(listing.region ?? "");
      setDescription(listing.description ?? "");
      setGrade(listing.grade ?? "");
      setCertifications(listing.certifications ?? "");
      setImageUrl(listing.imageUrl ?? "");
    } else {
      setTitle(""); setCategory("Cattle"); setPrice(""); setUnit("kg");
      setQuantity(""); setRegion(""); setDescription(""); setGrade(""); setCertifications(""); setImageUrl("");
    }
    setError("");
  }, [listing, open]);

  const createMutation = useCreateListing({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListListingsQueryKey() });
        qc.invalidateQueries({ queryKey: ["my-listings"] });
        onSuccess?.();
        onClose();
      },
      onError: (e: unknown) => {
        setError((e as Error)?.message ?? "Failed to create listing.");
      },
    },
  });

  const updateMutation = useUpdateListing({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListListingsQueryKey() });
        qc.invalidateQueries({ queryKey: ["my-listings"] });
        onSuccess?.();
        onClose();
      },
      onError: (e: unknown) => {
        setError((e as Error)?.message ?? "Failed to update listing.");
      },
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !price || !quantity) {
      setError("Title, price and quantity are required.");
      return;
    }
    const data = {
      title: title.trim(),
      category,
      price: parseFloat(price),
      unit,
      quantity: parseFloat(quantity),
      region: region || undefined,
      description: description || undefined,
      grade: grade || undefined,
      certifications: certifications || undefined,
      imageUrl: imageUrl.trim() || undefined,
    };
    if (isEdit && listing) {
      updateMutation.mutate({ id: listing.id, data });
    } else {
      createMutation.mutate({ data });
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            {isEdit ? "Edit Listing" : "Post New Listing"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Title *">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premium White Maize"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5F2D]/30"
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Region">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5F2D]/30"
              >
                <option value="">Select region…</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Field label="Price (NAD) *">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>

            <div className="col-span-1">
              <Field label="Quantity *">
                <Input
                  type="number"
                  min="1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="500"
                  required
                />
              </Field>
            </div>

            <div className="col-span-1">
              <Field label="Unit *">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C5F2D]/30"
                  required
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of your product…"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2C5F2D]/30"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade">
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade A"
              />
            </Field>
            <Field label="Certifications">
              <Input
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. Organic Certified"
              />
            </Field>
          </div>

          <Field label="Image URL (optional)">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… or /marketplace/tomatoes.png"
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white"
              style={{ backgroundColor: "#2C5F2D" }}
              disabled={isPending}
            >
              {isPending ? (isEdit ? "Saving…" : "Posting…") : (isEdit ? "Save Changes" : "Post Listing")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
