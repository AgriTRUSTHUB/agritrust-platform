import { useState, useEffect, useRef } from "react";

export type ListingImageInput = {
  id: number;
  name: string;
  category: string;
};

const MODULE_CACHE: Record<number, string> = {};

function buildPrompt(listing: ListingImageInput): string {
  const { name, category } = listing;
  const base = "ultra realistic, professional food photography, natural lighting, clean background, commercial grade, no text, no watermark";
  const map: Record<string, string> = {
    "Grains":            `Freshly harvested ${name}, golden tones, rustic wooden surface, natural light, Namibian farm, overhead shot, ${base}`,
    "Vegetables":        `Fresh ${name}, vibrant colour, morning light, farm crate or market setting, Namibian produce, ${base}`,
    "Fruit":             `Ripe ${name}, vivid natural colours, outdoor Namibian farm setting, natural sunlight, ${base}`,
    "Livestock":         `Healthy ${name}, standing in dry Namibian savanna or kraal, golden hour lighting, commercial farm photography, ${base}`,
    "Dairy & Eggs":      `Fresh ${name}, clean rustic wooden surface, natural warm light, farm aesthetic, ${base}`,
    "Honey & Organic":   `${name} in glass jar or natural container, warm golden light, wooden surface, organic farm aesthetic, Namibian context, ${base}`,
    "Inputs & Supplies": `${name} in farm setting, practical and clean composition, natural light, agricultural context, ${base}`,
    "Processed Foods":   `${name}, artisan packaging or rustic presentation, warm light, wooden surface, Namibian artisan food, ${base}`,
    "LandShare":         `Aerial wide-angle view of farmland in Namibian landscape, golden light, documentary style, ${base}`,
    "Energy":            `${name} in Namibian farm setting, wide angle, golden light, documentary style, ${base}`,
  };
  return map[category] ?? `Professional photo of ${name}, Namibian agricultural context, ${base}`;
}

export type ImageCache = Record<number, string>;

export function useMarketplaceImages(listings: ListingImageInput[]) {
  const [images, setImages] = useState<ImageCache>(() => {
    const cached: ImageCache = {};
    for (const l of listings) {
      if (MODULE_CACHE[l.id]) cached[l.id] = MODULE_CACHE[l.id];
    }
    return cached;
  });

  const [loading, setLoading] = useState<Set<number>>(new Set());
  const inFlight = useRef<Set<number>>(new Set());

  useEffect(() => {
    const toGenerate = listings.filter(
      (l) => !MODULE_CACHE[l.id] && !inFlight.current.has(l.id)
    );
    if (toGenerate.length === 0) return;

    for (const l of toGenerate) inFlight.current.add(l.id);

    setLoading((prev) => {
      const next = new Set(prev);
      for (const l of toGenerate) next.add(l.id);
      return next;
    });

    const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

    const batchSize = 5;
    const batches: ListingImageInput[][] = [];
    for (let i = 0; i < toGenerate.length; i += batchSize) {
      batches.push(toGenerate.slice(i, i + batchSize));
    }

    const processBatches = async () => {
      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(async (l) => {
            const prompt = buildPrompt(l);
            const res = await fetch(`${BASE}/api/marketplace/generate-image`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, listingId: l.id }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { dataUrl } = (await res.json()) as { dataUrl: string };
            MODULE_CACHE[l.id] = dataUrl;
            return { id: l.id, dataUrl };
          })
        );

        const resolved: ImageCache = {};
        for (const r of results) {
          if (r.status === "fulfilled") resolved[r.value.id] = r.value.dataUrl;
        }

        setImages((prev) => ({ ...prev, ...resolved }));
        setLoading((prev) => {
          const next = new Set(prev);
          for (const l of batch) {
            next.delete(l.id);
            inFlight.current.delete(l.id);
          }
          return next;
        });
      }
    };

    processBatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings.map((l) => l.id).join(",")]);

  return { images, loading };
}
