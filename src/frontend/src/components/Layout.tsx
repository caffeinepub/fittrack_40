import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Droplets,
  Dumbbell,
  LogOut,
  type LucideIcon,
  Target,
  TrendingUp,
  Utensils,
} from "lucide-react";
import type { ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

const navItems: { to: string; icon: LucideIcon; label: string }[] = [
  { to: "/", icon: Activity, label: "Dashboard" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/nutrition", icon: Utensils, label: "Nutrition" },
  { to: "/water", icon: Droplets, label: "Water" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/goals", icon: Target, label: "Goals" },
];

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      data-ocid={`nav.${label.toLowerCase()}.link`}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 group",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-xl transition-all duration-200",
          active ? "bg-primary/15 glow-primary-sm" : "group-hover:bg-secondary",
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-border h-full shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary-sm">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">
            FitTrack
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              data-ocid={`sidebar.${label.toLowerCase()}.link`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                pathname === to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  pathname === to
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {profile?.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              {profile?.name ?? "Athlete"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={clear}
            data-ocid="sidebar.logout.button"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center glow-primary-sm">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">
              FitTrack
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {profile?.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar/95 backdrop-blur-xl border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ to, icon, label }) => (
            <NavItem
              key={to}
              to={to}
              icon={icon}
              label={label}
              active={pathname === to}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
