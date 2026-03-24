import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, UserRole } from "../backend";
import { useActor } from "./useActor";

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useActiveAuctions(category?: Category) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeAuctions", category ? Object.keys(category)[0] : "all"],
    queryFn: async () => {
      if (!actor) return [];
      if (category) {
        return actor.getAuctionsByCategory(category);
      }
      return actor.getActiveAuctions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useAuctionDetail(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["auction", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAuction(id);
    },
    enabled: !!actor && !isFetching && id !== null,
    refetchInterval: 10000,
  });
}

export function useBidHistory(auctionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bidHistory", auctionId?.toString()],
    queryFn: async () => {
      if (!actor || auctionId === null) return [];
      return actor.getBidHistory(auctionId);
    },
    enabled: !!actor && !isFetching && auctionId !== null,
    refetchInterval: 10000,
  });
}

export function useMyAuctions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myAuctions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAuctions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAllAuctions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminAllAuctions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllAuctions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceBid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      auctionId,
      amount,
    }: {
      auctionId: bigint;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.placeBid(auctionId, amount);
    },
    onSuccess: (_, { auctionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["auction", auctionId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["bidHistory", auctionId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["activeAuctions"] });
    },
  });
}

export function useCancelAuction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.cancelAuction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["activeAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["adminAllAuctions"] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      secret,
    }: {
      displayName: string;
      secret: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.registerUser(displayName, secret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useCreateAuction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      category: Category;
      startingBid: bigint;
      endTime: bigint;
      photoKey: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createAuction(
        params.title,
        params.description,
        params.category,
        params.startingBid,
        params.endTime,
        params.photoKey,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["activeAuctions"] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}
