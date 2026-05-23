import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Navbar } from "./navbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GradientIcon, AgritrustGradientDefs } from "@/components/ui/gradient-icon";
import {
  LayoutDashboard,
  Store,
  MessageSquare,
  ScanSearch,
  Map,
  Wallet,
  Repeat,
  Truck,
  Users,
  LineChart,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard",      href: "/dashboard"       },
    { icon: Store,           label: "Marketplace",    href: "/marketplace"     },
    { icon: MessageSquare,   label: "DealWise",       href: "/dealwise"        },
    { icon: ScanSearch,      label: "QualityScan",    href: "/qualityscan"     },
    { icon: Map,             label: "LandShare",      href: "/landshare"       },
    { icon: Wallet,          label: "Harvest Finance",href: "/harvest-finance" },
    { icon: Repeat,          label: "Barter Exchange",href: "/barter"          },
    { icon: Truck,           label: "AgriHaul",       href: "/agrihaul"        },
    { icon: Users,           label: "Community",      href: "/community"       },
    { icon: LineChart,       label: "Accounting",     href: "/farm-accounting" },
    { icon: Scale,           label: "Disputes",       href: "/disputes"        },
    { icon: ShieldAlert,     label: "Theft Alerts",   href: "/theft-alerts"    },
    { icon: GraduationCap,   label: "Mentorship",     href: "/mentorship"      },
    { icon: BookOpen,        label: "Academy",        href: "/academy"         },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 border-r bg-background hidden md:flex flex-col">

          {/* Single gradient definition — browser resolves url() doc-wide */}
          <AgritrustGradientDefs />

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-0.5 px-2">
              {sidebarLinks.map((link) => {
                const isActive = location.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2.5 h-auto text-[15px] font-normal rounded-lg transition-all",
                        isActive
                          ? "bg-[#2C5F2D]/10 text-[#2C5F2D] font-semibold border-l-[3px] border-[#2C5F2D] rounded-l-none pl-[calc(0.75rem-3px)]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <GradientIcon icon={link.icon} active={isActive} />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Sidebar footer — logged-in user chip */}
          {user && (
            <div className="border-t px-4 py-3 flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: "#2C5F2D" }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[11px] text-gray-400 truncate capitalize">{user.role ?? "Farmer"}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
