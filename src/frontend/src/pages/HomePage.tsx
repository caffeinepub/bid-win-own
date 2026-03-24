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
      <section className="relative overflow-hidden py-24 md:py-40 px-4">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.62_0.22_155/0.10),transparent_60%)] pointer-events-none" />

        {/* Decorative diagonal stripe motif */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: "80%",
              height: "160%",
              background:
                "repeating-linear-gradient(" +
                "  -55deg," +
                "  transparent," +
                "  transparent 60px," +
                "  oklch(0.62 0.22 155 / 0.04) 60px," +
                "  oklch(0.62 0.22 155 / 0.04) 61px" +
                ")",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* LIVE chip */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <span
              className="live-dot inline-block w-2 h-2 rounded-full"
              style={{ background: "oklch(0.62 0.22 155)" }}
            />
            <span
              className="text-xs uppercase tracking-[0.35em]"
              style={{ color: "oklch(0.68 0.22 155)" }}
            >
              Live Auctions
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground ml-2">
              · Premium Authenticated Goods
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="font-display font-bold uppercase tracking-tight leading-none mb-4">
              <span className="block text-5xl md:text-7xl text-foreground">
                Own The
              </span>
              <span
                className="block text-shimmer"
                style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 1 }}
              >
                MOMENT.
              </span>
            </h1>

            {/* Emerald separator rule */}
            <div
              className="my-6"
              style={{
                height: "1px",
                width: "100%",
                maxWidth: "480px",
                background:
                  "linear-gradient(90deg, oklch(0.62 0.22 155 / 0.7), transparent)",
              }}
            />

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              The premier destination for authenticated sneakers and handbags.
              Bid live, win rare, own legendary.
            </p>

            <div className="flex items-center gap-4">
              {!isAuthenticated && (
                <Button
                  onClick={login}
                  data-ocid="hero.login.primary_button"
                  className="gold-gradient text-foreground font-semibold uppercase tracking-wider px-8 py-3 h-auto hover:opacity-90 transition-opacity shadow-lg"
                  style={{
                    boxShadow: "0 4px 24px oklch(0.62 0.22 155 / 0.30)",
                  }}
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
          <div
            className="border-l-2 pl-3"
            style={{ borderColor: "oklch(0.62 0.22 155)" }}
          >
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-foreground">
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
