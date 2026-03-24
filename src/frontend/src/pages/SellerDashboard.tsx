import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category } from "../backend";
import CountdownTimer from "../components/CountdownTimer";
import {
  useCancelAuction,
  useCreateAuction,
  useMyAuctions,
} from "../hooks/useQueries";
import { useStorage } from "../hooks/useStorage";
import { formatUsd, isEnded } from "../utils/format";

export default function SellerDashboard() {
  const { data: myAuctions = [], isLoading } = useMyAuctions();
  const { mutateAsync: createAuction, isPending: isCreating } =
    useCreateAuction();
  const { mutateAsync: cancelAuction, isPending: isCancelling } =
    useCancelAuction();
  const { uploadFile, isReady } = useStorage();

  const [showForm, setShowForm] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<bigint | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryVal, setCategoryVal] = useState<"Sneakers" | "Handbags">(
    "Sneakers",
  );
  const [startingBidDollars, setStartingBidDollars] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategoryVal("Sneakers");
    setStartingBidDollars("");
    setEndDatetime("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setUploadProgress(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startingBidDollars || !endDatetime) {
      toast.error("Please fill in all required fields");
      return;
    }
    const endMs = new Date(endDatetime).getTime();
    if (Number.isNaN(endMs) || endMs <= Date.now()) {
      toast.error("End time must be in the future");
      return;
    }
    const startBidCents = BigInt(
      Math.round(Number.parseFloat(startingBidDollars) * 100),
    );
    const endTimeNanos = BigInt(endMs) * 1_000_000n;
    const category: Category =
      categoryVal === "Sneakers" ? { Sneakers: null } : { Handbags: null };

    let photoKey = "";
    if (photoFile && isReady) {
      try {
        setUploadProgress(0);
        photoKey = await uploadFile(photoFile, (pct) => setUploadProgress(pct));
        setUploadProgress(100);
      } catch (err) {
        console.error("Photo upload failed", err);
        toast.error("Photo upload failed, listing without photo");
      }
    }

    try {
      await createAuction({
        title: title.trim(),
        description: description.trim(),
        category,
        startingBid: startBidCents,
        endTime: endTimeNanos,
        photoKey,
      });
      toast.success("Auction created!");
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create auction");
    }
  };

  const handleCancel = async (id: bigint) => {
    try {
      await cancelAuction(id);
      toast.success("Auction cancelled");
      setConfirmCancelId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel auction");
    }
  };

  const getStatusBadge = (auction: (typeof myAuctions)[0]) => {
    if ("Cancelled" in auction.status)
      return (
        <Badge variant="destructive" className="text-xs">
          Cancelled
        </Badge>
      );
    if ("Ended" in auction.status || isEnded(auction.endTime))
      return (
        <Badge variant="secondary" className="text-xs">
          Ended
        </Badge>
      );
    return (
      <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs">
        Active
      </Badge>
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div
          className="border-l-2 pl-3"
          style={{ borderColor: "oklch(0.62 0.22 155)" }}
        >
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your listings and create new auctions.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          data-ocid="seller.create.primary_button"
          className="font-semibold uppercase tracking-wider hover:opacity-90 transition-all"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.68 0.22 155), oklch(0.50 0.20 155))",
            color: "oklch(0.97 0 0)",
            boxShadow: "0 2px 16px oklch(0.62 0.22 155 / 0.25)",
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Auction
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-xl border border-border bg-card overflow-hidden"
          data-ocid="seller.create.panel"
        >
          {/* Emerald accent top bar */}
          <div
            style={{
              height: "3px",
              background:
                "linear-gradient(90deg, oklch(0.50 0.20 155), oklch(0.75 0.18 155), oklch(0.50 0.20 155))",
            }}
          />
          <div className="p-6">
            <h2 className="text-lg font-semibold uppercase tracking-wider mb-5">
              Create Auction
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    data-ocid="seller.title.input"
                    placeholder="Nike Air Jordan 1 Retro High OG"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-input border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={categoryVal}
                    onValueChange={(v) =>
                      setCategoryVal(v as "Sneakers" | "Handbags")
                    }
                  >
                    <SelectTrigger
                      className="bg-input border-border"
                      data-ocid="seller.category.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Sneakers">👟 Sneakers</SelectItem>
                      <SelectItem value="Handbags">👜 Handbags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  data-ocid="seller.description.textarea"
                  placeholder="Describe the item — condition, size, authentication details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-input border-border min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Starting Bid (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      data-ocid="seller.startbid.input"
                      placeholder="50"
                      value={startingBidDollars}
                      onChange={(e) => setStartingBidDollars(e.target.value)}
                      className="bg-input border-border pl-7"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Auction End Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    data-ocid="seller.endtime.input"
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}
                    className="bg-input border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Photo</Label>
                <button
                  type="button"
                  className="relative flex items-center justify-center h-36 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer w-full"
                  onClick={() => document.getElementById("photoInput")?.click()}
                  data-ocid="seller.photo.dropzone"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm">Click to upload photo</span>
                    </div>
                  )}
                  <input
                    id="photoInput"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                    data-ocid="seller.photo.upload_button"
                  />
                </button>
                {uploadProgress !== null && uploadProgress < 100 && (
                  <p
                    className="text-xs text-muted-foreground"
                    data-ocid="seller.upload.loading_state"
                  >
                    Uploading: {uploadProgress}%
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  data-ocid="seller.create.submit_button"
                  disabled={isCreating}
                  className="font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.68 0.22 155), oklch(0.50 0.20 155))",
                    color: "oklch(0.97 0 0)",
                  }}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isCreating ? "Creating..." : "Create Auction"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="seller.create.cancel_button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="border-border hover:border-primary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <Separator className="bg-border mb-8" />

      {/* My auctions */}
      <div>
        <h2 className="font-display text-lg font-semibold uppercase tracking-widest mb-5">
          My Listings
        </h2>

        {isLoading ? (
          <div className="space-y-3" data-ocid="seller.auctions.loading_state">
            {["a", "b", "c"].map((id) => (
              <Skeleton
                key={id}
                className="h-20 w-full bg-secondary rounded-xl"
              />
            ))}
          </div>
        ) : myAuctions.length === 0 ? (
          <div
            className="text-center py-16 border border-dashed border-border rounded-xl"
            data-ocid="seller.auctions.empty_state"
          >
            <p className="text-3xl mb-3">🏷️</p>
            <p className="text-muted-foreground">
              No listings yet. Create your first auction.
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="seller.auctions.list">
            {myAuctions.map((auction, i) => {
              const isActive =
                "Active" in auction.status && !isEnded(auction.endTime);
              const currentBid =
                auction.currentHighestBid > 0n
                  ? auction.currentHighestBid
                  : auction.startingBid;
              return (
                <motion.div
                  key={auction.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`seller.auction.item.${i + 1}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground truncate">
                        {auction.title}
                      </h3>
                      {getStatusBadge(auction)}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gold font-semibold">
                        {formatUsd(currentBid)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Number(auction.bidCount)} bids
                      </span>
                      {isActive && (
                        <CountdownTimer endTimeNanos={auction.endTime} />
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmCancelId(auction.id)}
                      data-ocid={`seller.auction.delete_button.${i + 1}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel confirm dialog */}
      <Dialog
        open={confirmCancelId !== null}
        onOpenChange={(open) => !open && setConfirmCancelId(null)}
      >
        <DialogContent
          className="sm:max-w-sm border-border bg-card"
          data-ocid="seller.cancel.dialog"
        >
          <DialogHeader>
            <DialogTitle>Cancel Auction?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The auction will be permanently
            cancelled.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="seller.cancel.cancel_button"
              onClick={() => setConfirmCancelId(null)}
              className="border-border"
            >
              Keep Auction
            </Button>
            <Button
              variant="destructive"
              data-ocid="seller.cancel.confirm_button"
              disabled={isCancelling}
              onClick={() =>
                confirmCancelId !== null && handleCancel(confirmCancelId)
              }
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Cancel Auction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
