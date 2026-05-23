import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListScans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UploadCloud, X, ImageIcon, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApiUrl, fetchWithAuth } from "@/lib/api";
import { GradientHeading } from "@/components/ui/gradient-heading";

const CROP_TYPES = ["Maize", "Wheat", "Millet", "Sorghum", "Sunflower", "Beans", "Groundnuts", "Cotton", "Vegetables", "Cattle", "Poultry", "Other"];

function getGradeColor(grade: string) {
  if (grade === "A") return "bg-green-600 text-white";
  if (grade === "B") return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

export default function QualityScan() {
  const { data: scans, isLoading, refetch } = useListScans();
  const [open, setOpen] = useState(false);
  const [cropType, setCropType] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetDialog = () => {
    setCropType("");
    setNotes("");
    setImageFile(null);
    setImagePreview(null);
    setStreamText("");
    setStreaming(false);
    setSubmitting(false);
    setStreamDone(false);
  };

  const handleSubmit = async () => {
    if (!cropType) return;
    setSubmitting(true);
    setStreamText("");
    setStreamDone(false);

    const body: Record<string, string> = { cropType, notes };
    if (imagePreview) body.imageData = imagePreview;

    try {
      setStreaming(true);

      const response = await fetchWithAuth(getApiUrl("/api/qualityscan/analyze"), {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!response.ok || !response.body) {
        throw new Error("Analysis request failed");
      }

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
          if (parsed.content) setStreamText(prev => prev + parsed.content);
          if (parsed.done) {
            setStreamDone(true);
            refetch();
          }
          if (parsed.error) {
            setStreamText(prev => prev + (prev ? "\n\n" : "") + "Error: " + parsed.error);
            setStreamDone(true);
          }
        }
      }
    } catch (err) {
      console.error("QualityScan error:", err);
      setStreamText("An error occurred during analysis. Please try again.");
      setStreamDone(true);
    } finally {
      setSubmitting(false);
      setStreaming(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetDialog, 300);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <GradientHeading>QualityScan AI</GradientHeading>
            <p className="text-muted-foreground mt-1">Submit crops for instant AI quality grading and certification.</p>
          </div>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <UploadCloud className="h-4 w-4" /> New Scan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold tracking-tight mb-4">Recent Scans</h2>
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                 <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
               ))
            ) : scans?.length === 0 ? (
               <Card><CardContent className="py-12 text-center text-muted-foreground">No scans yet. Click "New Scan" to analyse your first crop.</CardContent></Card>
            ) : (
               scans?.map(scan => (
                 <Card key={scan.id}>
                    <CardContent className="p-6 flex items-start gap-4">
                       <div className="h-20 w-20 bg-muted rounded-md shrink-0 flex items-center justify-center">
                          {scan.imageUrl ? <img src={scan.imageUrl} className="h-full w-full object-cover rounded-md" alt="scan" /> : <Search className="text-muted-foreground" />}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                               <h3 className="font-semibold text-lg">{scan.cropType}</h3>
                               <p className="text-sm text-muted-foreground">{new Date(scan.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                               <Badge className={`text-lg px-3 py-1 border-none ${getGradeColor(scan.grade)}`}>Grade {scan.grade}</Badge>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                             <div className="bg-muted p-2 rounded text-center">
                               <span className="text-muted-foreground block text-xs">Score</span>
                               <span className="font-medium">{scan.score}/100</span>
                             </div>
                             {scan.moisture && (
                               <div className="bg-muted p-2 rounded text-center">
                                 <span className="text-muted-foreground block text-xs">Moisture</span>
                                 <span className="font-medium">{scan.moisture}%</span>
                               </div>
                             )}
                             {scan.protein && (
                               <div className="bg-muted p-2 rounded text-center">
                                 <span className="text-muted-foreground block text-xs">Protein</span>
                                 <span className="font-medium">{scan.protein}%</span>
                               </div>
                             )}
                          </div>
                          {scan.recommendations && (
                            <p className="mt-3 text-sm text-muted-foreground">{scan.recommendations}</p>
                          )}
                       </div>
                    </CardContent>
                 </Card>
               ))
            )}
          </div>

          <div className="space-y-6">
             <Card>
                <CardHeader>
                   <CardTitle>How QualityScan Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                   <div className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                      <p>Upload clear photos of your crop sample from multiple angles.</p>
                   </div>
                   <div className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                      <p>Our AI analyses the imagery for defects, color consistency, and size uniformity.</p>
                   </div>
                   <div className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                      <p>Receive an instant grading report that you can attach directly to your marketplace listings.</p>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v && !submitting) handleClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> QualityScan AI Analysis
            </DialogTitle>
          </DialogHeader>

          {!streamText ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Crop Type *</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger><SelectValue placeholder="Select crop type" /></SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Crop Photo (optional but recommended)</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-md border" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload a crop photo</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG up to 10MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="e.g. Harvested last week, stored in cool conditions, some surface discolouration noticed..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
                <Button onClick={handleSubmit} disabled={!cropType || submitting} className="flex-1 gap-2">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing...</> : <><Sparkles className="h-4 w-4" /> Analyse Crop</>}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {streamDone
                  ? <><CheckCircle className="h-4 w-4 text-green-600" /> Analysis complete</>
                  : <><Loader2 className="h-4 w-4 animate-spin text-primary" /> AI is analysing your crop...</>
                }
              </div>
              <div className="bg-muted/40 rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono min-h-[200px]">
                {streamText}
                {!streamDone && <span className="animate-pulse">▌</span>}
              </div>
              {streamDone && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1">Close</Button>
                  <Button onClick={() => { resetDialog(); }} className="flex-1 gap-2">
                    <UploadCloud className="h-4 w-4" /> Scan Another Crop
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
