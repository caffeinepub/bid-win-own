import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterUser } from "../hooks/useQueries";

interface Props {
  open: boolean;
}

export default function RegisterModal({ open }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [secret, setSecret] = useState("");
  const { mutateAsync, isPending } = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    try {
      await mutateAsync({ displayName: displayName.trim(), secret });
      toast.success("Welcome to BID. WIN. OWN.");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md border-border bg-card"
        data-ocid="register.modal"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-gold">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a display name to start bidding on exclusive sneakers and
            handbags.
          </DialogDescription>
        </DialogHeader>
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4 mt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">
              Display Name
            </Label>
            <Input
              id="displayName"
              data-ocid="register.input"
              placeholder="e.g. SneakerKing"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret" className="text-muted-foreground text-sm">
              Admin Secret (optional)
            </Label>
            <Input
              id="secret"
              type="password"
              data-ocid="register.secret.input"
              placeholder="Leave blank for standard account"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            data-ocid="register.submit_button"
            disabled={isPending || !displayName.trim()}
            className="w-full gold-gradient text-primary-foreground font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isPending ? "Creating Account..." : "Enter the Auction House"}
          </Button>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
