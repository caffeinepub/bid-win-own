import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import type { Auction } from "../backend";
import { useStorage } from "../hooks/useStorage";
import { formatUsd, isEnded, isEndingSoon } from "../utils/format";
import CountdownTimer from "./CountdownTimer";

interface Props {
  auction: Auction;
  index: number;
  onSelect: (auction: Auction) => void;
  isAuthenticated: boolean;
}

export default function AuctionCard({
  auction,
  index,
  onSelect,
  isAuthenticated,
}: Props) {
  const { getPhotoUrl } = useStorage();
  const photoUrl = auction.photoKey ? getPhotoUrl(auction.photoKey) : null;

  const isSneak = "Sneakers" in auction.category;
  const categoryLabel = isSneak ? "Sneakers" : "Handbags";
  const categoryEmoji = isSneak ? "👟" : "👜";

  const ended = isEnded(auction.endTime);
  const endingSoon = isEndingSoon(auction.endTime);
  const cancelled = "Cancelled" in auction.status;

  const currentBid =
    auction.currentHighestBid > 0n
      ? auction.currentHighestBid
      : auction.startingBid;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      data-ocid={`auction.item.${index + 1}`}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-border card-gradient hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(auction)}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-accent/20">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {categoryEmoji}
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {endingSoon && !ended && (
            <Badge className="bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider animate-pulse">
              Ending Soon
            </Badge>
          )}
          {cancelled && (
            <Badge
              variant="secondary"
              className="text-xs uppercase tracking-wider"
            >
              Cancelled
            </Badge>
          )}
          {ended && !cancelled && (
            <Badge
              variant="secondary"
              className="text-xs uppercase tracking-wider"
            >
              Ended
            </Badge>
          )}
        </div>

        {/* Timer chip */}
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
          <CountdownTimer endTimeNanos={auction.endTime} />
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="outline"
            className="bg-background/60 backdrop-blur-sm border-border text-xs"
          >
            {categoryLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
          {auction.title}
        </h3>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Current Bid
            </p>
            <p className="text-xl font-bold text-gold">
              {formatUsd(currentBid)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {Number(auction.bidCount)} bid
              {Number(auction.bidCount) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Button
          data-ocid={`auction.${index + 1}.primary_button`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(auction);
          }}
          disabled={ended || cancelled}
          className="w-full gold-gradient text-primary-foreground font-semibold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {ended || cancelled
            ? "View Details"
            : isAuthenticated
              ? "Place Bid"
              : "Connect to Bid"}
        </Button>
      </div>
    </motion.article>
  );
}
