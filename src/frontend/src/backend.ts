/* eslint-disable */
// @ts-nocheck
import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";
export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;
export type UserRole = { admin: null } | { guest: null } | { user: null };
export type Category = { Handbags: null } | { Sneakers: null };
export type AuctionStatus = { Active: null } | { Cancelled: null } | { Ended: null };
export interface Auction {
    id: bigint; seller: Principal; title: string; description: string;
    category: Category; startingBid: bigint; currentHighestBid: bigint;
    highestBidder: [] | [Principal]; endTime: bigint; status: AuctionStatus;
    photoKey: string; bidCount: bigint;
}
export interface Bid { bidder: Principal; amount: bigint; timestamp: bigint; }
export interface UserProfile { principal: Principal; displayName: string; role: UserRole; }
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
export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}
export class Backend implements backendInterface {
    constructor(private actor: ActorSubclass<_SERVICE>, private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, private processError?: (error: unknown) => never) {}
    private handleError(e: unknown): never {
        if (this.processError) return this.processError(e);
        throw e;
    }
    async initializeAccessControl(secret: string): Promise<void> {
        try { await this.actor._initializeAccessControlWithSecret(secret); } catch(e) { this.handleError(e); }
    }
    async registerUser(displayName: string, secret: string): Promise<void> {
        try { await this.actor.registerUser(displayName, secret); } catch(e) { this.handleError(e); }
    }
    async getMyProfile(): Promise<UserProfile> {
        try { return await this.actor.getMyProfile(); } catch(e) { this.handleError(e); }
    }
    async getCallerUserRole(): Promise<UserRole> {
        try { return await this.actor.getCallerUserRole(); } catch(e) { this.handleError(e); }
    }
    async isCallerAdmin(): Promise<boolean> {
        try { return await this.actor.isCallerAdmin(); } catch(e) { this.handleError(e); }
    }
    async getAllUsers(): Promise<UserProfile[]> {
        try { return await this.actor.getAllUsers(); } catch(e) { this.handleError(e); }
    }
    async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
        try { await this.actor.assignCallerUserRole(user, role); } catch(e) { this.handleError(e); }
    }
    async getActiveAuctions(): Promise<Auction[]> {
        try { return await this.actor.getActiveAuctions(); } catch(e) { this.handleError(e); }
    }
    async getAuctionsByCategory(category: Category): Promise<Auction[]> {
        try { return await this.actor.getAuctionsByCategory(category); } catch(e) { this.handleError(e); }
    }
    async getAuction(id: bigint): Promise<Auction | null> {
        try {
            const result = await this.actor.getAuction(id);
            return result.length > 0 ? result[0] : null;
        } catch(e) { this.handleError(e); }
    }
    async getMyAuctions(): Promise<Auction[]> {
        try { return await this.actor.getMyAuctions(); } catch(e) { this.handleError(e); }
    }
    async createAuction(title: string, description: string, category: Category, startingBid: bigint, endTime: bigint, photoKey: string): Promise<bigint> {
        try { return await this.actor.createAuction(title, description, category, startingBid, endTime, photoKey); } catch(e) { this.handleError(e); }
    }
    async cancelAuction(id: bigint): Promise<void> {
        try { await this.actor.cancelAuction(id); } catch(e) { this.handleError(e); }
    }
    async placeBid(auctionId: bigint, amount: bigint): Promise<void> {
        try { await this.actor.placeBid(auctionId, amount); } catch(e) { this.handleError(e); }
    }
    async getBidHistory(auctionId: bigint): Promise<Bid[]> {
        try { return await this.actor.getBidHistory(auctionId); } catch(e) { this.handleError(e); }
    }
    async adminGetAllAuctions(): Promise<Auction[]> {
        try { return await this.actor.adminGetAllAuctions(); } catch(e) { this.handleError(e); }
    }
}
export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}
export function createActor(canisterId: string, _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, options: CreateActorOptions = {}): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    const actor = Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId, ...options.actorOptions });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
