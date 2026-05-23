import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListNegotiations, useAcceptNegotiation, useCreateNegotiation } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Scale, Loader2, RefreshCw, X, MapPin, Tag } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { GradientHeading } from "@/components/ui/gradient-heading";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    countered: "bg-blue-100 text-blue-800 border-blue-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return <Badge variant="outline" className={map[status] ?? ""}>{status}</Badge>;
}

interface StreamState {
  [negotiationId: number]: { text: string; loading: boolean; done: boolean };
}

// ── Draft negotiation prefill banner (for static listings) ────────
interface PrefillDraft {
  listingId: number;
  title: string;
  price: number;
  qty: number;
  unit: string;
  seller: string;
  region: string;
  category: string;
}

function parsePrefill(search: string): PrefillDraft | null {
  try {
    const p = new URLSearchParams(search);
    const listingId = parseInt(p.get("listingId") ?? "", 10);
    const title = p.get("title") ?? "";
    const price = parseFloat(p.get("price") ?? "");
    const qty = parseInt(p.get("qty") ?? "", 10);
    if (!listingId || !title || !price || !qty) return null;
    return {
      listingId,
      title,
      price,
      qty,
      unit: p.get("unit") ?? "unit",
      seller: p.get("seller") ?? "Unknown Seller",
      region: p.get("region") ?? "",
      category: p.get("category") ?? "",
    };
  } catch {
    return null;
  }
}

function DraftNegotiationBanner({
  draft,
  onDismiss,
  onConfirm,
}: {
  draft: PrefillDraft;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  const [offerPrice, setOfferPrice] = useState(String(draft.price));
  const [offerQty, setOfferQty] = useState(String(draft.qty));
  const createNegotiation = useCreateNegotiation();
  const { toast } = useToast();

  const handleConfirm = () => {
    const price = parseFloat(offerPrice);
    const qty = parseInt(offerQty, 10);
    if (!price || !qty) {
      toast({ title: "Please enter a valid price and quantity.", variant: "destructive" });
      return;
    }
    createNegotiation.mutate(
      { data: { listingId: draft.listingId, offeredPrice: price, quantity: qty } },
      {
        onSuccess: () => {
          toast({ title: "Negotiation opened!", description: "DealWise AI is now analysing your offer." });
          onConfirm();
        },
        onError: (err: unknown) => {
          // Surface the real failure — keep the draft visible so the buyer
          // can retry or adjust their offer rather than silently losing context.
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Please sign in or try again shortly.";
          toast({
            title: "Could not open negotiation",
            description: message,
            variant: "destructive",
          });
          // Draft stays visible — do NOT call onConfirm() on failure
        },
      }
    );
  };

  return (
    <Card className="border-[#2C5F2D]/40 bg-[#f6faf4] mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#2C5F2D]" />
            <div>
              <CardTitle className="text-base text-[#2C5F2D]">New Negotiation Draft</CardTitle>
              <CardDescription className="text-xs mt-0.5">Review and confirm your offer before DealWise AI analyses it</CardDescription>
            </div>
          </div>
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-white border px-4 py-3 space-y-1">
          <p className="font-semibold text-gray-900">{draft.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {draft.seller && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{draft.seller}</span>}
            {draft.region && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{draft.region}</span>}
            {draft.category && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{draft.category}</span>}
          </div>
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
              className="text-sm bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity ({draft.unit})</label>
            <Input
              type="number"
              min="1"
              value={offerQty}
              onChange={e => setOfferQty(e.target.value)}
              className="text-sm bg-white"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={createNegotiation.isPending}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#2C5F2D" }}
          >
            {createNegotiation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm &amp; Open Negotiation
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealWise() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const prefill = parsePrefill(search);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const showDraft = !!prefill && !draftDismissed;

  const { data: negotiations, isLoading, refetch } = useListNegotiations();
  const acceptMutation = useAcceptNegotiation();
  const [streams, setStreams] = useState<StreamState>({});

  const streamAnalysis = async (id: number) => {
    setStreams(prev => ({ ...prev, [id]: { text: "", loading: true, done: false } }));

    try {
      const response = await fetchWithAuth(getApiUrl(`/api/dealwise/negotiations/${id}/analyze`), {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!response.ok || !response.body) throw new Error("Analysis request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let parsed: { content?: string; done?: boolean; error?: string } | null = null;
          try {
            parsed = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (parsed.content) {
            setStreams(prev => ({
              ...prev,
              [id]: { ...prev[id], text: (prev[id]?.text ?? "") + parsed.content, loading: true, done: false },
            }));
          }
          if (parsed.done) {
            setStreams(prev => ({ ...prev, [id]: { ...prev[id], loading: false, done: true } }));
            refetch();
          }
          if (parsed.error) {
            setStreams(prev => ({
              ...prev,
              [id]: { text: "Analysis failed: " + parsed.error, loading: false, done: true },
            }));
          }
        }
      }
    } catch (err) {
      console.error("DealWise stream error:", err);
      setStreams(prev => ({
        ...prev,
        [id]: { text: "Analysis failed. Please try again.", loading: false, done: true },
      }));
    }
  };

  const handleAccept = async (id: number) => {
    await acceptMutation.mutateAsync({ id });
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GradientHeading>DealWise AI</GradientHeading>
            <Badge variant="secondary" className="bg-[#2196F3]/10 text-[#2196F3] border-[#2196F3]/20">AI Powered</Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Your intelligent negotiation center. Review offers, get live AI analysis based on market data, and close deals securely.
          </p>
        </div>

        {showDraft && (
          <DraftNegotiationBanner
            draft={prefill!}
            onDismiss={() => { setDraftDismissed(true); navigate("/dealwise", { replace: true }); }}
            onConfirm={() => { setDraftDismissed(true); navigate("/dealwise", { replace: true }); refetch(); }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold tracking-tight mb-4">Active Negotiations</h2>

            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : negotiations?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Scale className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="font-medium text-foreground">No active negotiations</p>
                  <p className="text-sm mt-1 mb-6">Start browsing the marketplace to make an offer on a listing.</p>
                  <Button asChild variant="outline">
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              negotiations?.map(neg => {
                const stream = streams[neg.id];
                const displayText = stream?.text || neg.aiSuggestion;
                const isStreaming = stream?.loading;
                const isAccepted = neg.status === "accepted";

                return (
                  <Card key={neg.id} className="overflow-hidden">
                    <div className="border-l-4 border-l-accent">
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <StatusBadge status={neg.status} />
                            <CardTitle className="text-lg mt-2">{neg.listingTitle}</CardTitle>
                            <CardDescription className="mt-1">
                              With <span className="font-medium text-foreground">{neg.buyerName || neg.sellerName}</span>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Original: NAD {Number(neg.originalPrice).toLocaleString()}</p>
                            <p className="text-xl font-bold text-primary">Current: NAD {Number(neg.currentPrice).toLocaleString()}</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-4">
                        <div className="bg-[#2196F3]/5 border border-[#2196F3]/20 rounded-md p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-[#2196F3] shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-foreground">DealWise AI Analysis</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-[#2196F3] hover:text-[#2196F3] hover:bg-[#2196F3]/10"
                                  disabled={isStreaming || isAccepted}
                                  onClick={() => streamAnalysis(neg.id)}
                                >
                                  {isStreaming
                                    ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Analysing</>
                                    : <><RefreshCw className="h-3 w-3 mr-1" />Refresh</>
                                  }
                                </Button>
                              </div>
                              {isStreaming && !stream?.text ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin" /> Analysing market data...
                                </div>
                              ) : displayText ? (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {displayText}
                                  {isStreaming && <span className="animate-pulse">▌</span>}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">
                                  Click "Refresh" to get a live AI analysis of this negotiation.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {!isAccepted && (
                        <CardFooter className="bg-muted/30 border-t pt-4 flex gap-3">
                          <Button
                            className="flex-1"
                            onClick={() => handleAccept(neg.id)}
                            disabled={acceptMutation.isPending}
                          >
                            Accept Offer
                          </Button>
                          <Button variant="outline" className="flex-1" asChild>
                            <Link href={`/marketplace`}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Counter Offer
                            </Link>
                          </Button>
                        </CardFooter>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">How DealWise Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">1</div>
                  <p className="text-sm text-muted-foreground mt-1">Make or receive an initial offer on a marketplace listing.</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">2</div>
                  <p className="text-sm text-muted-foreground mt-1">Our AI analyses current market rates, your FarmScore, and seasonal demand to suggest a fair price.</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">3</div>
                  <p className="text-sm text-muted-foreground mt-1">Click "Refresh" on any negotiation for a live streaming AI analysis. Accept or counter with confidence.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
