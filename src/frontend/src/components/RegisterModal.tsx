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
  const { mutateAsync: registerUser, isPending } = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    try {
      await registerUser({
        displayName: displayName.trim(),
        secret: secret.trim(),
      });
      toast.success("Profile created!");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-sm border-border bg-card p-0 overflow-hidden"
        data-ocid="register.modal"
      >
        {/* Emerald accent bar */}
        <div
          className="w-full"
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, oklch(0.50 0.20 155), oklch(0.75 0.18 155), oklch(0.50 0.20 155))",
          }}
        />
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-display font-bold">
              <span style={{ color: "oklch(0.62 0.22 155)" }}>◆</span> Complete
              Your Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Create your account to start bidding and selling.
            </DialogDescription>
          </DialogHeader>

          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
            data-ocid="register.form.panel"
          >
            <div className="space-y-2">
              <Label className="text-sm">Display Name *</Label>
              <Input
                data-ocid="register.name.input"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-input border-border"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Admin Secret <span className="text-xs">(optional)</span>
              </Label>
              <Input
                type="password"
                data-ocid="register.secret.input"
                placeholder="Leave blank if not admin"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <Button
              type="submit"
              data-ocid="register.submit_button"
              disabled={isPending}
              className="w-full font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.68 0.22 155), oklch(0.50 0.20 155))",
                color: "oklch(0.97 0 0)",
              }}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </motion.form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
