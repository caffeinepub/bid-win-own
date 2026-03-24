import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import RegisterModal from "./components/RegisterModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useMyProfile } from "./hooks/useQueries";
import AdminPanel from "./pages/AdminPanel";
import HomePage from "./pages/HomePage";
import SellerDashboard from "./pages/SellerDashboard";

type View = "home" | "seller" | "admin";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: profile,
    isFetched: profileFetched,
    isLoading: profileLoading,
  } = useMyProfile();
  const { data: isAdmin } = useIsAdmin();

  // Show registration modal when logged in but no profile
  const showRegister =
    isAuthenticated &&
    !isInitializing &&
    !profileLoading &&
    profileFetched &&
    profile === null;

  const handleNavigate = (view: View) => {
    if (view === "admin" && !isAdmin) return;
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav currentView={currentView} onNavigate={handleNavigate} />

      <div className="flex-1">
        {currentView === "home" && <HomePage />}
        {currentView === "seller" && isAuthenticated && <SellerDashboard />}
        {currentView === "seller" && !isAuthenticated && <HomePage />}
        {currentView === "admin" && isAuthenticated && isAdmin && (
          <AdminPanel />
        )}
        {currentView === "admin" && (!isAuthenticated || !isAdmin) && (
          <HomePage />
        )}
      </div>

      <Footer />

      <RegisterModal open={showRegister} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
