/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

const UserRole = IDL.Variant({ admin: IDL.Null, guest: IDL.Null, user: IDL.Null });
const Category = IDL.Variant({ Handbags: IDL.Null, Sneakers: IDL.Null });
const AuctionStatus = IDL.Variant({ Active: IDL.Null, Cancelled: IDL.Null, Ended: IDL.Null });
const Auction = IDL.Record({
  id: IDL.Nat,
  seller: IDL.Principal,
  title: IDL.Text,
  description: IDL.Text,
  category: Category,
  startingBid: IDL.Nat,
  currentHighestBid: IDL.Nat,
  highestBidder: IDL.Opt(IDL.Principal),
  endTime: IDL.Int,
  status: AuctionStatus,
  photoKey: IDL.Text,
  bidCount: IDL.Nat,
});
const Bid = IDL.Record({ bidder: IDL.Principal, amount: IDL.Nat, timestamp: IDL.Int });
const UserProfile = IDL.Record({ principal: IDL.Principal, displayName: IDL.Text, role: UserRole });

export const idlService = IDL.Service({
  _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
  adminGetAllAuctions: IDL.Func([], [IDL.Vec(Auction)], ['query']),
  assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
  cancelAuction: IDL.Func([IDL.Nat], [], []),
  createAuction: IDL.Func([IDL.Text, IDL.Text, Category, IDL.Nat, IDL.Int, IDL.Text], [IDL.Nat], []),
  getActiveAuctions: IDL.Func([], [IDL.Vec(Auction)], ['query']),
  getAllUsers: IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
  getAuction: IDL.Func([IDL.Nat], [IDL.Opt(Auction)], ['query']),
  getAuctionsByCategory: IDL.Func([Category], [IDL.Vec(Auction)], ['query']),
  getBidHistory: IDL.Func([IDL.Nat], [IDL.Vec(Bid)], ['query']),
  getCallerUserRole: IDL.Func([], [UserRole], ['query']),
  getMyAuctions: IDL.Func([], [IDL.Vec(Auction)], ['query']),
  getMyProfile: IDL.Func([], [UserProfile], ['query']),
  isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
  placeBid: IDL.Func([IDL.Nat, IDL.Nat], [], []),
  registerUser: IDL.Func([IDL.Text, IDL.Text], [], []),
});

export const idlInitArgs = [];
export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({ admin: IDL.Null, guest: IDL.Null, user: IDL.Null });
  const Category = IDL.Variant({ Handbags: IDL.Null, Sneakers: IDL.Null });
  const AuctionStatus = IDL.Variant({ Active: IDL.Null, Cancelled: IDL.Null, Ended: IDL.Null });
  const Auction = IDL.Record({
    id: IDL.Nat,
    seller: IDL.Principal,
    title: IDL.Text,
    description: IDL.Text,
    category: Category,
    startingBid: IDL.Nat,
    currentHighestBid: IDL.Nat,
    highestBidder: IDL.Opt(IDL.Principal),
    endTime: IDL.Int,
    status: AuctionStatus,
    photoKey: IDL.Text,
    bidCount: IDL.Nat,
  });
  const Bid = IDL.Record({ bidder: IDL.Principal, amount: IDL.Nat, timestamp: IDL.Int });
  const UserProfile = IDL.Record({ principal: IDL.Principal, displayName: IDL.Text, role: UserRole });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    adminGetAllAuctions: IDL.Func([], [IDL.Vec(Auction)], ['query']),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    cancelAuction: IDL.Func([IDL.Nat], [], []),
    createAuction: IDL.Func([IDL.Text, IDL.Text, Category, IDL.Nat, IDL.Int, IDL.Text], [IDL.Nat], []),
    getActiveAuctions: IDL.Func([], [IDL.Vec(Auction)], ['query']),
    getAllUsers: IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    getAuction: IDL.Func([IDL.Nat], [IDL.Opt(Auction)], ['query']),
    getAuctionsByCategory: IDL.Func([Category], [IDL.Vec(Auction)], ['query']),
    getBidHistory: IDL.Func([IDL.Nat], [IDL.Vec(Bid)], ['query']),
    getCallerUserRole: IDL.Func([], [UserRole], ['query']),
    getMyAuctions: IDL.Func([], [IDL.Vec(Auction)], ['query']),
    getMyProfile: IDL.Func([], [UserProfile], ['query']),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
    placeBid: IDL.Func([IDL.Nat, IDL.Nat], [], []),
    registerUser: IDL.Func([IDL.Text, IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
