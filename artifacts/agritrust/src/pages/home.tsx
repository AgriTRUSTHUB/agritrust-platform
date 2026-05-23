import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Shield, TrendingUp, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { platformStats } from "@/data/platformStats";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-primary/5">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight mb-6">
                Africa's Most Complete <span className="text-primary">Agricultural Ecosystem</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Empowering farmers, connecting markets, and driving sustainable growth. Trade, finance, and scale your agricultural business with absolute trust.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                  <Link href="/register">Join AgriTRUST Today</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
            <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-3xl" />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center divide-x divide-border/50">
              <div className="flex flex-col space-y-2">
                <span className="text-3xl font-bold text-primary">{platformStats.platformMembers}</span>
                <span className="text-sm font-medium text-muted-foreground">Platform Members</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-3xl font-bold text-primary">{platformStats.activeListings}</span>
                <span className="text-sm font-medium text-muted-foreground">Active Listings</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-3xl font-bold text-primary">{platformStats.totalTransacted}</span>
                <span className="text-sm font-medium text-muted-foreground">Value Transacted</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-3xl font-bold text-primary">{platformStats.treesPlanted}</span>
                <span className="text-sm font-medium text-muted-foreground">Trees Planted</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-3xl font-bold text-primary">{platformStats.disputeResolutionRate}</span>
                <span className="text-sm font-medium text-muted-foreground">Dispute Resolution Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Everything You Need to Succeed</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">One unified platform integrating marketplace, logistics, finance, and community.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Intelligent Marketplace</h3>
                  <p className="text-muted-foreground mb-6">Connect directly with verified buyers and sellers. Use DealWise AI to negotiate better prices.</p>
                  <Button variant="link" asChild className="p-0 h-auto font-medium text-primary">
                    <Link href="/marketplace" className="flex items-center gap-1">Explore Markets <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-accent/30 transition-all hover:shadow-md">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Harvest Finance</h3>
                  <p className="text-muted-foreground mb-6">Access micro-loans, track your FarmScore, and manage your agricultural accounting effortlessly.</p>
                  <Button variant="link" asChild className="p-0 h-auto font-medium text-accent">
                    <Link href="/harvest-finance" className="flex items-center gap-1">View Financials <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-[#2196F3]/30 transition-all hover:shadow-md">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-lg bg-[#2196F3]/10 flex items-center justify-center mb-6">
                    <Users className="h-6 w-6 text-[#2196F3]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Community Hub</h3>
                  <p className="text-muted-foreground mb-6">Share knowledge, access expert mentorship, and build your professional agricultural network.</p>
                  <Button variant="link" asChild className="p-0 h-auto font-medium text-[#2196F3]">
                    <Link href="/community" className="flex items-center gap-1">Join Community <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Transform Your Farming Business?</h2>
            <p className="text-primary-foreground/80 mb-10 max-w-2xl mx-auto text-lg">
              Join thousands of verified farmers, buyers, and service providers growing the future of agriculture on AgriTRUST.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg h-12 px-8">
              <Link href="/register">Create Your Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
