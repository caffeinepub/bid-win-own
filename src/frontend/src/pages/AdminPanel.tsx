import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Loader2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile, UserRole } from "../backend";
import CountdownTimer from "../components/CountdownTimer";
import {
  useAdminAllAuctions,
  useAllUsers,
  useAssignRole,
  useCancelAuction,
} from "../hooks/useQueries";
import { formatUsd, isEnded, shortenPrincipal } from "../utils/format";

export default function AdminPanel() {
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: allAuctions = [], isLoading: auctionsLoading } =
    useAdminAllAuctions();
  const { mutateAsync: assignRole, isPending: isAssigning } = useAssignRole();
  const { mutateAsync: cancelAuction, isPending: isCancelling } =
    useCancelAuction();
  const [pendingRoleUser, setPendingRoleUser] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    setPendingRoleUser(user.principal.toString());
    try {
      await assignRole({ user: user.principal, role });
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role");
    } finally {
      setPendingRoleUser(null);
    }
  };

  const handleCancelAuction = async (id: bigint) => {
    setPendingCancelId(id.toString());
    try {
      await cancelAuction(id);
      toast.success("Auction cancelled");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel auction");
    } finally {
      setPendingCancelId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    if ("admin" in role)
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs">
          Admin
        </Badge>
      );
    if ("user" in role)
      return (
        <Badge variant="secondary" className="text-xs">
          User
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs">
        Guest
      </Badge>
    );
  };

  const getAuctionStatus = (auction: (typeof allAuctions)[0]) => {
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users and all platform auctions.
          </p>
        </div>

        <Tabs defaultValue="users" data-ocid="admin.tab">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger
              value="users"
              className="text-sm uppercase tracking-wider"
            >
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger
              value="auctions"
              className="text-sm uppercase tracking-wider"
            >
              Auctions ({allAuctions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {usersLoading ? (
              <div className="space-y-2" data-ocid="admin.users.loading_state">
                {["a", "b", "c", "d"].map((id) => (
                  <Skeleton
                    key={id}
                    className="h-14 w-full bg-secondary rounded-lg"
                  />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div
                className="text-center py-16 border border-dashed border-border rounded-xl"
                data-ocid="admin.users.empty_state"
              >
                <p className="text-muted-foreground">
                  No users registered yet.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border border-border overflow-hidden"
                data-ocid="admin.users.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Principal
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Display Name
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Role
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, i) => (
                      <TableRow
                        key={user.principal.toString()}
                        className="border-border"
                        data-ocid={`admin.users.row.${i + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {shortenPrincipal(user.principal)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {user.displayName}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-ocid={`admin.users.role.toggle.${i + 1}`}
                                disabled={
                                  isAssigning &&
                                  pendingRoleUser === user.principal.toString()
                                }
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                {isAssigning &&
                                pendingRoleUser ===
                                  user.principal.toString() ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                Change Role
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-popover border-border"
                              data-ocid={`admin.users.role.dropdown_menu.${i + 1}`}
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user, { admin: null })
                                }
                                className="cursor-pointer"
                              >
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user, { user: null })
                                }
                                className="cursor-pointer"
                              >
                                Make User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user, { guest: null })
                                }
                                className="cursor-pointer"
                              >
                                Make Guest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="auctions">
            {auctionsLoading ? (
              <div
                className="space-y-2"
                data-ocid="admin.auctions.loading_state"
              >
                {["a", "b", "c", "d"].map((id) => (
                  <Skeleton
                    key={id}
                    className="h-14 w-full bg-secondary rounded-lg"
                  />
                ))}
              </div>
            ) : allAuctions.length === 0 ? (
              <div
                className="text-center py-16 border border-dashed border-border rounded-xl"
                data-ocid="admin.auctions.empty_state"
              >
                <p className="text-muted-foreground">
                  No auctions on the platform yet.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border border-border overflow-hidden"
                data-ocid="admin.auctions.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Title
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Category
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Current Bid
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-wider text-xs">
                        Time
                      </TableHead>
                      <TableHead className="text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAuctions.map((auction, i) => {
                      const isActive =
                        "Active" in auction.status && !isEnded(auction.endTime);
                      const currentBid =
                        auction.currentHighestBid > 0n
                          ? auction.currentHighestBid
                          : auction.startingBid;
                      return (
                        <TableRow
                          key={auction.id.toString()}
                          className="border-border"
                          data-ocid={`admin.auctions.row.${i + 1}`}
                        >
                          <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                            {auction.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {"Sneakers" in auction.category
                              ? "👟 Sneakers"
                              : "👜 Handbags"}
                          </TableCell>
                          <TableCell className="text-gold font-semibold text-sm">
                            {formatUsd(currentBid)}
                          </TableCell>
                          <TableCell>{getAuctionStatus(auction)}</TableCell>
                          <TableCell>
                            {isActive ? (
                              <CountdownTimer endTimeNanos={auction.endTime} />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelAuction(auction.id)}
                                data-ocid={`admin.auctions.delete_button.${i + 1}`}
                                disabled={
                                  isCancelling &&
                                  pendingCancelId === auction.id.toString()
                                }
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {isCancelling &&
                                pendingCancelId === auction.id.toString() ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
