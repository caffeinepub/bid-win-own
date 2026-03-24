import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useState } from "react";
import type { Auction, Category } from "../backend";
import AuctionCard from "../components/AuctionCard";
import AuctionModal from "../components/AuctionModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useActiveAuctions } from "../hooks/useQueries";

type FilterTab = "all" | "sneakers" | "handbags";

export default function HomePage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const category: Category | undefined =
    filter === "sneakers"
      ? { Sneakers: null }
      : filter === "handbags"
        ? { Handbags: null }
        : undefined;

  const { data: auctions = [], isLoading } = useActiveAuctions(category);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.11_75/0.08),transparent_60%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Premium Authenticated Goods
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-foreground leading-none mb-6">
              Own The
              <span className="block text-gold">Moment.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              The premier destination for authenticated sneakers and handbags.
              Bid live, win rare, own legendary.
            </p>
            <div className="flex items-center gap-4">
              {!isAuthenticated && (
                <Button
                  onClick={login}
                  data-ocid="hero.login.primary_button"
                  className="gold-gradient text-primary-foreground font-semibold uppercase tracking-wider px-8 py-3 h-auto hover:opacity-90 transition-opacity"
                >
                  Start Bidding
                </Button>
              )}
              <Button
                variant="outline"
                data-ocid="hero.browse.secondary_button"
                className="border-border hover:border-primary text-muted-foreground hover:text-foreground uppercase tracking-wider text-sm"
                onClick={() => {
                  document
                    .getElementById("auctions")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse Auctions
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auctions section */}
      <section
        id="auctions"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">
              Live Auctions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {auctions.length} active listing{auctions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterTab)}
            data-ocid="auction.filter.tab"
          >
            <TabsList className="bg-secondary">
              <TabsTrigger
                value="all"
                className="text-xs uppercase tracking-wider"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="sneakers"
                className="text-xs uppercase tracking-wider"
              >
                Sneakers
              </TabsTrigger>
              <TabsTrigger
                value="handbags"
                className="text-xs uppercase tracking-wider"
              >
                Handbags
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="auction.loading_state"
          >
            {["a", "b", "c", "d", "e", "f"].map((id) => (
              <div
                key={id}
                className="rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-[4/3] w-full bg-secondary" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-secondary" />
                  <Skeleton className="h-6 w-1/2 bg-secondary" />
                  <Skeleton className="h-10 w-full bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div
            className="text-center py-24 border border-dashed border-border rounded-xl"
            data-ocid="auction.empty_state"
          >
            <p className="text-4xl mb-4">🏷️</p>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Active Auctions
            </h3>
            <p className="text-muted-foreground text-sm">
              Check back soon or list your own items.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="auction.list"
          >
            {auctions.map((auction, i) => (
              <AuctionCard
                key={auction.id.toString()}
                auction={auction}
                index={i}
                onSelect={setSelectedAuction}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </section>

      <AuctionModal
        auction={selectedAuction}
        isAuthenticated={isAuthenticated}
        onClose={() => setSelectedAuction(null)}
      />
    </main>
  );
}
