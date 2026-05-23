import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Zap, Sun, Wind, Droplets, TrendingDown, ShoppingCart,
  CheckCircle2, ArrowRight, BarChart3, Leaf, Star, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ENERGY_SOLUTIONS = [
  {
    id: "solar-pump",
    name: "Solar Water Pump",
    description: "Submersible solar pump system for borehole and irrigation — no grid connection required.",
    power: "1.5–5 kW",
    price: 18500,
    subsidy: 4625,
    paybackYears: 2.5,
    co2Saved: 3.2,
    icon: Sun,
    tags: ["Most Popular", "Irrigation"],
    features: ["25-year panel lifespan", "No running costs", "Remote monitoring", "Installation included"],
  },
  {
    id: "solar-home",
    name: "Farm Solar Home System",
    description: "Complete off-grid power solution for farmhouse — lighting, refrigeration, phone charging.",
    power: "3 kW + Battery",
    price: 32000,
    subsidy: 8000,
    paybackYears: 3.8,
    co2Saved: 5.8,
    icon: Zap,
    tags: ["Off-Grid"],
    features: ["10 kWh battery storage", "48-hour backup capacity", "LED lighting kit", "Smart inverter included"],
  },
  {
    id: "biogas",
    name: "Biogas Digester",
    description: "Convert livestock waste into cooking gas and organic fertiliser — dual-purpose system.",
    power: "3–6 m³ gas/day",
    price: 12000,
    subsidy: 3600,
    paybackYears: 1.8,
    co2Saved: 7.4,
    icon: Leaf,
    tags: ["Livestock Farms", "Fertiliser"],
    features: ["Cooking gas output", "Organic slurry fertiliser", "Odour reduction", "20-year lifespan"],
  },
  {
    id: "wind-pump",
    name: "Wind Pump System",
    description: "Traditional Namibian wind pump upgraded with modern materials — ideal for remote cattle posts.",
    power: "500–2,000 L/day",
    price: 9500,
    subsidy: 2375,
    paybackYears: 2.0,
    co2Saved: 2.1,
    icon: Wind,
    tags: ["Cattle Farming", "Remote"],
    features: ["No electricity needed", "Low maintenance", "Proven Namibian design", "5-year warranty"],
  },
  {
    id: "drip-solar",
    name: "Drip Irrigation Solar Kit",
    description: "Solar-powered drip irrigation system with moisture sensors — reduces water use by 60%.",
    power: "0.75 kW",
    price: 14500,
    subsidy: 3625,
    paybackYears: 2.2,
    co2Saved: 2.8,
    icon: Droplets,
    tags: ["Horticulture", "Water Saving"],
    features: ["Smart moisture sensors", "Mobile app control", "60% water saving", "Covers up to 2 ha"],
  },
  {
    id: "solar-cold",
    name: "Solar Cold Room",
    description: "Off-grid cold storage for produce — reduce post-harvest losses from 40% to under 5%.",
    power: "2 kW cooling",
    price: 45000,
    subsidy: 13500,
    paybackYears: 4.5,
    co2Saved: 8.2,
    icon: TrendingDown,
    tags: ["Post-Harvest", "Premium"],
    features: ["5-tonne capacity", "0–8°C temperature control", "Remote temperature alerts", "Financed via Harvest Finance"],
  },
];

const ENERGY_STATS = [
  { label: "Systems Installed", value: "4,280" },
  { label: "kWh Generated Annually", value: "12.4M" },
  { label: "CO₂ Avoided (tonnes)", value: "8,640" },
  { label: "Average Payback", value: "2.7 yrs" },
];

const SUBSIDIES = [
  { name: "GreenFarm Grant", provider: "Ministry of Agriculture", discount: "25% off solar systems", eligibility: "Smallholder farmers with < 50 ha" },
  { name: "MEATCO Biogas", provider: "MEATCO Namibia", discount: "30% off biogas digesters", eligibility: "Registered cattle producers" },
  { name: "Agribank Green Loan", provider: "Agribank Namibia", discount: "7% interest rate", eligibility: "FarmScore ≥ 400" },
  { name: "NDC Climate Fund", provider: "Namibia Development Corp", discount: "Up to NAD 15,000 grant", eligibility: "First-time renewable installation" },
];

export default function AgriEnergy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const [farmSize, setFarmSize] = useState("");
  const [primaryUse, setPrimaryUse] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  const allTags = ["all", "Most Popular", "Off-Grid", "Livestock Farms", "Irrigation", "Horticulture", "Post-Harvest"];

  const filteredSolutions = filterTag === "all"
    ? ENERGY_SOLUTIONS
    : ENERGY_SOLUTIONS.filter(s => s.tags.includes(filterTag));

  const handleEnquire = (solutionName: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to enquire about energy solutions.", variant: "destructive" });
      return;
    }
    toast({ title: "Enquiry Submitted", description: `Your enquiry for ${solutionName} has been sent. An AgriEnergy consultant will contact you within 2 business days.` });
    setSelectedSolution(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-[#F5A623] to-[#e09612] text-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sun className="h-7 w-7" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Renewable Energy</Badge>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">AgriEnergy</h1>
          <p className="text-amber-100 text-lg max-w-2xl mb-8">
            Namibia gets 300+ sunshine days per year. AgriEnergy connects farmers with subsidised solar, biogas, and wind solutions — reducing costs and carbon footprint simultaneously.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ENERGY_STATS.map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-amber-100 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="bg-[#1A6B3A]/5 border border-[#1A6B3A]/20 rounded-2xl p-6">
            <h2 className="font-playfair text-xl font-bold text-foreground mb-4">Find the Right Solution for Your Farm</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Farm Size (hectares)</Label>
                <Input className="mt-1" value={farmSize} onChange={e => setFarmSize(e.target.value)} />
              </div>
              <div>
                <Label>Primary Energy Need</Label>
                <Select value={primaryUse} onValueChange={setPrimaryUse}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irrigation">Irrigation & Water Pumping</SelectItem>
                    <SelectItem value="household">Farm Household Power</SelectItem>
                    <SelectItem value="cold-storage">Cold Storage</SelectItem>
                    <SelectItem value="processing">Crop Processing</SelectItem>
                    <SelectItem value="livestock">Livestock Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-[#1A6B3A] text-white"
                  onClick={() => {
                    if (!farmSize || !primaryUse) { toast({ title: "Please fill in all fields", variant: "destructive" }); return; }
                    toast({ title: "Assessment Request Sent", description: "An AgriEnergy consultant will call you within 24 hours to schedule a free farm energy assessment." });
                  }}
                >
                  Request Free Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-2xl font-bold">Energy Solutions</h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-colors ${
                      filterTag === tag
                        ? "bg-[#1A6B3A] text-white border-[#1A6B3A]"
                        : "border-border text-muted-foreground hover:border-[#1A6B3A]/50"
                    }`}
                  >
                    {tag === "all" ? "All Solutions" : tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolutions.map((solution) => {
                const Icon = solution.icon;
                const netPrice = solution.price - solution.subsidy;
                return (
                  <Card key={solution.id} className="border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-[#F5A623]" />
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {solution.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-base mt-3">{solution.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{solution.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">List Price</span>
                          <span className="line-through text-muted-foreground">NAD {solution.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">GreenFarm Subsidy</span>
                          <span className="text-green-600">-NAD {solution.subsidy.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-border pt-2">
                          <span>Your Price</span>
                          <span className="text-[#1A6B3A]">NAD {netPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Payback</p>
                          <p className="text-sm font-bold">{solution.paybackYears} yrs</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                          <p className="text-sm font-bold">{solution.co2Saved}t/yr</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Output</p>
                          <p className="text-sm font-bold truncate">{solution.power}</p>
                        </div>
                      </div>
                      <ul className="space-y-1.5">
                        {solution.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#1A6B3A] flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full bg-[#1A6B3A] text-white"
                        onClick={() => handleEnquire(solution.name)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" /> Enquire Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Available Subsidies & Grants</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {SUBSIDIES.map((sub) => (
                <Card key={sub.name} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{sub.name}</h3>
                        <p className="text-xs text-muted-foreground">{sub.provider}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">{sub.discount}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Eligibility: {sub.eligibility}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#F5A623]/10 to-[#1A6B3A]/10 border border-[#F5A623]/20 rounded-2xl p-8 text-center">
            <Leaf className="h-12 w-12 text-[#1A6B3A] mx-auto mb-4" />
            <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">Carbon Credits for Every Installation</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Every verified renewable energy system earns ImpactLedger carbon credits. Track your environmental contribution and earn additional income through verified carbon markets.
            </p>
            <Link href="/impact">
              <Button className="bg-[#1A6B3A] text-white">
                View ImpactLedger <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
