import { useLocation } from "wouter";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Settings, Shield, UserCircle, Bell, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      setLocation("/login");
    }
  }, [token, isLoading, setLocation]);

  if (isLoading || !user) {
    return <DashboardLayout><div className="flex items-center justify-center py-12">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <GradientHeading>Account Settings</GradientHeading>
          <p className="text-muted-foreground mt-1">Manage your profile, preferences, and security settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 space-y-2">
            <Button variant="secondary" className="w-full justify-start font-medium bg-muted/50">
              <UserCircle className="h-4 w-4 mr-2" /> Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Shield className="h-4 w-4 mr-2" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Key className="h-4 w-4 mr-2" /> Integrations
            </Button>
          </div>

          <div className="col-span-1 md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal and farm details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={user.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={user.role} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={user.region || ""} disabled />
                  </div>
                </div>
                <div className="pt-4">
                  <Button disabled>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}