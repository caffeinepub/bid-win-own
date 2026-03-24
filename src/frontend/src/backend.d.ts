import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface backendInterface {
    initializeAccessControl(secret: string): Promise<void>;
    registerUser(displayName: string, secret: string): Promise<void>;
    getMyProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    getAllUsers(): Promise<UserProfile[]>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getActiveAuctions(): Promise<Auction[]>;
    getAuctionsByCategory(category: Category): Promise<Auction[]>;
    getAuction(id: bigint): Promise<Auction | null>;
    getMyAuctions(): Promise<Auction[]>;
    createAuction(title: string, description: string, category: Category, startingBid: bigint, endTime: bigint, photoKey: string): Promise<bigint>;
    cancelAuction(id: bigint): Promise<void>;
    placeBid(auctionId: bigint, amount: bigint): Promise<void>;
    getBidHistory(auctionId: bigint): Promise<Bid[]>;
    adminGetAllAuctions(): Promise<Auction[]>;
}
