import { Redirect } from "wouter";
import { useAuth } from "@/contexts/auth-context";

interface PrivateRouteProps {
  component: React.ComponentType;
}

export function PrivateRoute({ component: Component }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-[#1A6B3A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}
