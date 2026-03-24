import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export type UserRole = { admin: null } | { guest: null } | { user: null };
export type Category = { Handbags: null } | { Sneakers: null };
export type AuctionStatus = { Active: null } | { Cancelled: null } | { Ended: null };
export interface Auction {
  id: bigint;
  seller: Principal;
  title: string;
  description: string;
  category: Category;
  startingBid: bigint;
  currentHighestBid: bigint;
  highestBidder: [] | [Principal];
  endTime: bigint;
  status: AuctionStatus;
  photoKey: string;
  bidCount: bigint;
}
export interface Bid {
  bidder: Principal;
  amount: bigint;
  timestamp: bigint;
}
export interface UserProfile {
  principal: Principal;
  displayName: string;
  role: UserRole;
}
export interface _SERVICE {
  _initializeAccessControlWithSecret: ActorMethod<[string], undefined>;
  adminGetAllAuctions: ActorMethod<[], Auction[]>;
  assignCallerUserRole: ActorMethod<[Principal, UserRole], undefined>;
  cancelAuction: ActorMethod<[bigint], undefined>;
  createAuction: ActorMethod<[string, string, Category, bigint, bigint, string], bigint>;
  getActiveAuctions: ActorMethod<[], Auction[]>;
  getAllUsers: ActorMethod<[], UserProfile[]>;
  getAuction: ActorMethod<[bigint], [] | [Auction]>;
  getAuctionsByCategory: ActorMethod<[Category], Auction[]>;
  getBidHistory: ActorMethod<[bigint], Bid[]>;
  getCallerUserRole: ActorMethod<[], UserRole>;
  getMyAuctions: ActorMethod<[], Auction[]>;
  getMyProfile: ActorMethod<[], UserProfile>;
  isCallerAdmin: ActorMethod<[], boolean>;
  placeBid: ActorMethod<[bigint, bigint], undefined>;
  registerUser: ActorMethod<[string, string], undefined>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
