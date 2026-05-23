import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Globe, TrendingUp, Leaf, Award,
  ArrowRight, CheckCircle2, Building2, Handshake, BookOpen, Zap,
  Linkedin, Github, Twitter,
} from "lucide-react";
import { platformStats } from "@/data/platformStats";

const PILLARS = [
  { icon: ShieldCheck, title: "Trust & Security", description: "HMAC-signed transactions, verified farmer profiles, and transparent dispute resolution ensure every deal is safe." },
  { icon: TrendingUp, title: "Market Access", description: "Connect directly with buyers, negotiate with AI assistance, and get fair prices for your produce." },
  { icon: Leaf, title: "Sustainability", description: "Track your environmental impact, earn green credits, and contribute to measurable climate goals." },
  { icon: BookOpen, title: "Knowledge & Growth", description: "Access expert mentorship, attend AgriAcademy courses, and learn from a thriving farmer community." },
  { icon: Building2, title: "Financial Inclusion", description: "FarmScore credit ratings unlock Harvest Finance loans, AgriSave accounts, and working capital." },
  { icon: Globe, title: "Pan-African Vision", description: "Built for Namibia's farming communities with a roadmap to serve every agricultural region across Africa." },
];

const STATS = [
  { value: String(platformStats.platformMembers), label: "Platform Members" },
  { value: String(platformStats.activeListings), label: "Active Listings" },
  { value: platformStats.totalTransacted, label: "Value Transacted" },
  { value: String(platformStats.impactRecords), label: "Impact Records" },
  { value: platformStats.disputeResolutionRate, label: "Dispute Resolution Rate" },
  { value: String(platformStats.platformPillars), label: "Platform Pillars" },
  { value: String(platformStats.unSdgsAddressed), label: "UN SDGs Addressed" },
];

const FOUNDERS = [
  {
    initials: "LD",
    gradient: "linear-gradient(135deg, #1A6B3A, #0F4D28)",
    name: "Loide Dawid",
    title: "Chief Executive Officer & Co-Founder",
    bio: "Loide Dawid is the visionary behind AgriTRUST. With a deep passion for food security and rural empowerment, she founded AgriTRUST to give Africa's farmers the trust, tools, and markets they deserve. Her leadership is rooted in the belief that agriculture must be both profitable and purposeful.",
    tags: ["Agricultural Strategy", "Food Security", "Rural Empowerment", "Impact Leadership"],
    social: [
      { icon: Linkedin, href: "#", label: "LinkedIn" },
      { icon: Twitter, href: "#", label: "Twitter" },
    ],
  },
  {
    initials: "PI",
    gradient: "linear-gradient(135deg, #1A3A6B, #0F2347)",
    name: "Paulus Indongo",
    title: "Chief Technology Officer & Co-Founder",
    bio: "Paulus Indongo architects the technology that powers AgriTRUST's AI, blockchain, and digital infrastructure. With expertise in agricultural fintech and ethical AI, he ensures the platform is fast, secure, and accessible to every farmer — including those with basic phones in remote areas.",
    tags: ["AI & Machine Learning", "Blockchain", "AgriFinTech", "Ethical Technology"],
    social: [
      { icon: Linkedin, href: "#", label: "LinkedIn" },
      { icon: Github, href: "#", label: "GitHub" },
      { icon: Twitter, href: "#", label: "Twitter" },
    ],
  },
];

const MILESTONES = [
  { year: "2021", event: "AgriTRUST founded in Windhoek with seed funding from the Namibia Development Corporation." },
  { year: "2022", event: "Pilot launch: 1,200 farmers onboarded in Khomas and Oshikoto regions." },
  { year: "2023", event: "FarmScore and Harvest Finance launched; first NAD 5M in loans disbursed." },
  { year: "2024", event: "QualityScan AI and DealWise negotiation engine deployed; platform reaches first active community." },
  { year: "2025", event: "ImpactLedger goes live; 88 impact records logged across all 14 Namibian regions." },
  { year: "2026", event: "Full 26-pillar platform live; expansion into Botswana and Zambia underway." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[#1A6B3A] text-white py-24 px-6">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">Our Story</Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
            Building Trust in Every<br />Agricultural Transaction
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
            <span style={{ color: "#C8A951" }}>Agri</span><span style={{ color: "#2C5F2D", fontWeight: "bold" }}>TRUST</span> was founded on a single belief: that Namibia's farmers deserve the same financial tools, market access, and technological advantages as any modern enterprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#F5A623] hover:bg-[#e09612] text-white border-0">
                Join the Platform <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#1A6B3A]">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Badge className="mb-3 bg-[#1A6B3A]/10 text-[#1A6B3A] border-[#1A6B3A]/20">Our Mission</Badge>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
                Empowering the Backbone of Namibia's Economy
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">
                Agriculture employs over 70% of Namibia's population, yet smallholder farmers have historically been excluded from formal financial systems, fair markets, and modern technology.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                AgriTRUST closes this gap through a single, integrated platform — from selling produce and securing loans, to learning new skills and tracking environmental impact.
              </p>
              <div className="space-y-3">
                {["Verified farmer identities with FarmScore credit profiles", "AI-powered price negotiation that levels the playing field", "Transparent impact tracking aligned with 14 UN SDGs", "Financial services built on trust, not collateral alone"].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#1A6B3A] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#1A6B3A] to-[#2d9e5e] flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Handshake className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <p className="font-playfair text-2xl font-semibold">Every farmer deserves a fair deal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-[#1A6B3A]/10 text-[#1A6B3A] border-[#1A6B3A]/20">Platform Pillars</Badge>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">Six Foundations of Agricultural Trust</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-[#1A6B3A]/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-[#1A6B3A]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20">Our Journey</Badge>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">From Vision to Platform</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#1A6B3A]/20 hidden md:block" />
            <div className="space-y-8">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-[#1A6B3A] text-white flex items-center justify-center font-bold text-sm z-10 relative">
                      {m.year}
                    </div>
                  </div>
                  <div className="pt-3">
                    <p className="text-foreground leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-[#1A6B3A]/10 text-[#1A6B3A] border-[#1A6B3A]/20">Leadership</Badge>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">The Team Behind <span style={{ color: "#C8A951" }}>Agri</span><span style={{ color: "#2C5F2D" }}>TRUST</span></h2>
          </div>
          <div className="max-w-[720px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {FOUNDERS.map((founder) => (
              <Card
                key={founder.name}
                className="border border-border rounded-2xl shadow-md text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="p-8">
                  <div
                    className="h-24 w-24 rounded-full text-white flex items-center justify-center text-2xl font-bold mx-auto mb-5"
                    style={{ background: founder.gradient }}
                  >
                    {founder.initials}
                  </div>
                  <h3 className="font-semibold text-foreground text-base mb-1">{founder.name}</h3>
                  <p className="text-sm text-[#1A6B3A] font-medium mb-4">{founder.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{founder.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center mb-5">
                    {founder.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-center">
                    {founder.social.map(({ icon: Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        onClick={(e) => e.preventDefault()}
                        className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground italic">
            AgriTRUST is built with a growing team of agronomists, engineers, designers, and field agents across Southern Africa.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-[#2196F3]/10 text-[#2196F3] border-[#2196F3]/20">Partners & Recognition</Badge>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">Trusted by Leading Organisations</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Namibia Development Corporation", "Ministry of Agriculture", "African Development Bank", "IFAD Rural Finance", "FNB Namibia", "Bank of Namibia", "UN Food & Agriculture", "GIZ Namibia"].map((partner) => (
              <div key={partner} className="border border-border rounded-xl p-4 text-center">
                <Award className="h-8 w-8 text-[#1A6B3A] mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#1A6B3A] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Zap className="h-12 w-12 mx-auto mb-6 text-[#F5A623]" />
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Farming Business?
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Join {platformStats.platformMembers} founding members already using AgriTRUST to sell smarter, borrow fairly, and grow sustainably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#F5A623] hover:bg-[#e09612] text-white border-0">
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
