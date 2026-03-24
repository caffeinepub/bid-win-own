import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Auction } from "../backend";
import {
  useAuctionDetail,
  useBidHistory,
  usePlaceBid,
} from "../hooks/useQueries";
import { useStorage } from "../hooks/useStorage";
import { formatUsd, isEnded, shortenPrincipal, timeAgo } from "../utils/format";
import CountdownTimer from "./CountdownTimer";

interface Props {
  auction: Auction | null;
  isAuthenticated: boolean;
  onClose: () => void;
}

export default function AuctionModal({
  auction,
  isAuthenticated,
  onClose,
}: Props) {
  const [bidAmount, setBidAmount] = useState("");
  const { getPhotoUrl } = useStorage();
  const { data: liveAuction } = useAuctionDetail(auction?.id ?? null);
  const { data: bidHistory = [] } = useBidHistory(auction?.id ?? null);
  const { mutateAsync: placeBid, isPending } = usePlaceBid();

  const current = liveAuction ?? auction;
  if (!current) return null;

  const photoUrl = current.photoKey ? getPhotoUrl(current.photoKey) : null;
  const isSneak = "Sneakers" in current.category;
  const categoryEmoji = isSneak ? "👟" : "👜";
  const ended = isEnded(current.endTime);
  const cancelled = "Cancelled" in current.status;
  const currentBid =
    current.currentHighestBid > 0n
      ? current.currentHighestBid
      : current.startingBid;
  const minBid = currentBid + 1n;

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const dollars = Number.parseFloat(bidAmount);
    if (Number.isNaN(dollars) || dollars <= 0) return;
    const amountCents = BigInt(Math.round(dollars * 100));
    if (amountCents < minBid) {
      toast.error(`Bid must be at least ${formatUsd(minBid)}`);
      return;
    }
    try {
      await placeBid({ auctionId: current.id, amount: amountCents });
      toast.success("Bid placed successfully!");
      setBidAmount("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to place bid");
    }
  };

  return (
    <Dialog open={!!auction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col border-border bg-card p-0 overflow-hidden"
        data-ocid="auction.modal"
      >
        {/* Emerald accent bar at top */}
        <div
          className="w-full flex-shrink-0"
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, oklch(0.50 0.20 155), oklch(0.75 0.18 155), oklch(0.50 0.20 155))",
          }}
        />

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left: Image */}
          <div className="relative md:w-2/5 aspect-square md:aspect-auto bg-accent/20 flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={current.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {categoryEmoji}
              </div>
            )}
            <div className="absolute top-3 left-3">
              {ended || cancelled ? (
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {cancelled ? "Cancelled" : "Ended"}
                </Badge>
              ) : (
                <Badge className="bg-destructive text-destructive-foreground uppercase tracking-wider">
                  Live
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col flex-1 min-h-0">
            <DialogHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-2">
                <DialogTitle className="text-lg font-semibold leading-snug">
                  {current.title}
                </DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {current.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">
                  Seller: {shortenPrincipal(current.seller)}
                </span>
                <CountdownTimer endTimeNanos={current.endTime} />
              </div>
            </DialogHeader>

            <Separator className="bg-border" />

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-5 space-y-4">
                {/* Current bid */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Current Bid
                    </p>
                    <p className="text-3xl font-bold text-gold">
                      {formatUsd(currentBid)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {Number(current.bidCount)} bids
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {formatUsd(minBid)}
                    </p>
                  </div>
                </div>

                {/* Winner if ended */}
                {ended && current.highestBidder.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30"
                  >
                    <Trophy className="h-5 w-5 text-gold" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Winner
                      </p>
                      <p className="text-sm font-semibold text-gold">
                        {shortenPrincipal(current.highestBidder[0]!)}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Bid form */}
                {!ended && !cancelled && isAuthenticated && (
                  <form
                    onSubmit={handleBid}
                    className="space-y-2"
                    data-ocid="auction.bid.panel"
                  >
                    <Label className="text-sm text-muted-foreground">
                      Your Bid (USD)
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="1"
                          min={Number(minBid) / 100}
                          data-ocid="auction.bid.input"
                          placeholder={`${Number(minBid) / 100}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="pl-7 bg-input border-border"
                        />
                      </div>
                      <Button
                        type="submit"
                        data-ocid="auction.bid.submit_button"
                        disabled={isPending}
                        className="font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.68 0.22 155), oklch(0.50 0.20 155))",
                          color: "oklch(0.97 0 0)",
                        }}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Bid"
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {!ended && !cancelled && !isAuthenticated && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Connect your wallet to place a bid.
                  </p>
                )}

                {/* Bid history */}
                {bidHistory.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Bid History
                    </p>
                    <div
                      className="space-y-1.5"
                      data-ocid="auction.bidhistory.list"
                    >
                      {bidHistory
                        .slice()
                        .sort((a, b) => Number(b.amount - a.amount))
                        .slice(0, 10)
                        .map((bid, i) => (
                          <div
                            key={`bid-${bid.bidder.toString()}-${bid.timestamp.toString()}`}
                            className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                            data-ocid={`auction.bidhistory.item.${i + 1}`}
                          >
                            <span className="text-xs text-muted-foreground font-mono">
                              {shortenPrincipal(bid.bidder)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(bid.timestamp)}
                              </span>
                              <span className="text-sm font-semibold text-foreground">
                                {formatUsd(bid.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
