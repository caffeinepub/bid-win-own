import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, ShieldCheck, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useMyProfile } from "../hooks/useQueries";

type View = "home" | "seller" | "admin";

interface Props {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Nav({ currentView, onNavigate }: Props) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useMyProfile();
  const { data: isAdmin } = useIsAdmin();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate("home");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            data-ocid="nav.link"
            className="font-display font-bold text-xl tracking-widest text-gold hover:opacity-80 transition-opacity"
          >
            BID. WIN. OWN.
          </button>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[{ label: "Live Auctions", view: "home" as View }].map(
              ({ label, view }) => (
                <button
                  type="button"
                  key={view}
                  onClick={() => onNavigate(view)}
                  data-ocid={`nav.${view}.link`}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                    currentView === view
                      ? "text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => {
                onNavigate("home");
              }}
              data-ocid="nav.sneakers.link"
              className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Sneakers
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate("home");
              }}
              data-ocid="nav.handbags.link"
              className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Handbags
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("admin")}
                data-ocid="nav.admin.link"
                className={`text-xs uppercase tracking-wider ${
                  currentView === "admin"
                    ? "text-gold"
                    : "text-muted-foreground"
                }`}
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                Admin
              </Button>
            )}
            {isAuthenticated && (
              <Button
                size="sm"
                onClick={() => onNavigate("seller")}
                data-ocid="nav.sell.button"
                variant="outline"
                className={`text-xs uppercase tracking-wider border-border hover:border-primary ${
                  currentView === "seller" ? "border-primary text-gold" : ""
                }`}
              >
                + Sell
              </Button>
            )}
            {!isAuthenticated ? (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.login.button"
                className="gold-gradient text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
                size="sm"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {isLoggingIn ? "Connecting..." : "Connect"}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid="nav.profile.button"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-xs max-w-[100px] truncate">
                      {profile?.displayName || "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border"
                  data-ocid="nav.profile.dropdown_menu"
                >
                  <DropdownMenuItem
                    onClick={handleLogout}
                    data-ocid="nav.logout.button"
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
