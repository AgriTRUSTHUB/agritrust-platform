import { Link } from "wouter";
import { Leaf } from "lucide-react";
import agriTrustLogo from "@assets/Logo_1778949846906.png";

export function Footer() {
  return (
    <footer className="bg-sidebar border-t py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src={agriTrustLogo} alt="AgriTRUST" className="h-8 w-auto" />
              <span className="font-serif font-bold text-xl">
                <span style={{ color: "#97BC62" }}>Agri</span><span style={{ color: "#2C5F2D" }}>TRUST</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Africa's most complete agricultural ecosystem. Empowering farmers, connecting markets, and driving sustainable growth across the continent.
            </p>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/dealwise" className="hover:text-primary transition-colors">DealWise AI</Link></li>
              <li><Link href="/qualityscan" className="hover:text-primary transition-colors">QualityScan</Link></li>
              <li><Link href="/landshare" className="hover:text-primary transition-colors">LandShare</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Financial</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/harvest-finance" className="hover:text-primary transition-colors">Harvest Finance</Link></li>
              <li><Link href="/barter" className="hover:text-primary transition-colors">Barter Exchange</Link></li>
              <li><Link href="/farmscore" className="hover:text-primary transition-colors">FarmScore</Link></li>
              <li><Link href="/farm-accounting" className="hover:text-primary transition-colors">Accounting</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="hover:text-primary transition-colors">Hub</Link></li>
              <li><Link href="/mentorship" className="hover:text-primary transition-colors">Mentorship</Link></li>
              <li><Link href="/academy" className="hover:text-primary transition-colors">AgriAcademy</Link></li>
              <li><Link href="/impact" className="hover:text-primary transition-colors">ImpactLedger</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AgriTRUST. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}