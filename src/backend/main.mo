import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import MixinBlobStorage "./blob-storage/Mixin";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  // ---- Authorization mixin ----
  let _accessControlState = AccessControl.initState();
  include MixinAuthorization(_accessControlState);

  // ---- Blob storage mixin ----
  include MixinBlobStorage();

  // ---- Types ----
  public type Category = { #Sneakers; #Handbags };
  public type AuctionStatus = { #Active; #Ended; #Cancelled };

  public type Auction = {
    id : Nat;
    seller : Principal;
    title : Text;
    description : Text;
    category : Category;
    startingBid : Nat;
    currentHighestBid : Nat;
    highestBidder : ?Principal;
    endTime : Int;
    status : AuctionStatus;
    photoKey : Text;
    bidCount : Nat;
  };

  public type Bid = {
    bidder : Principal;
    amount : Nat;
    timestamp : Int;
  };

  public type UserProfile = {
    principal : Principal;
    displayName : Text;
    role : AccessControl.UserRole;
  };

  // ---- State ----
  var nextAuctionId : Nat = 0;
  let auctions = Map.empty<Nat, Auction>();
  let bidHistory = Map.empty<Nat, [Bid]>();
  let displayNames = Map.empty<Principal, Text>();

  // ---- User Registration ----
  public shared ({ caller }) func registerUser(displayName : Text, secret : Text) : async () {
    await _initializeAccessControlWithSecret(secret);
    displayNames.add(caller, displayName);
  };

  public query ({ caller }) func getMyProfile() : async UserProfile {
    let role = AccessControl.getUserRole(_accessControlState, caller);
    let name = switch (displayNames.get(caller)) {
      case (?n) n;
      case null "";
    };
    { principal = caller; displayName = name; role = role };
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    var result : [UserProfile] = [];
    for ((p, role) in _accessControlState.userRoles.entries()) {
      let name = switch (displayNames.get(p)) { case (?n) n; case null "" };
      result := result.concat([{ principal = p; displayName = name; role = role }]);
    };
    result;
  };

  // ---- Auction Management ----
  public shared ({ caller }) func createAuction(
    title : Text,
    description : Text,
    category : Category,
    startingBid : Nat,
    endTime : Int,
    photoKey : Text,
  ) : async Nat {
    let role = AccessControl.getUserRole(_accessControlState, caller);
    switch (role) {
      case (#guest) Runtime.trap("Must be registered");
      case _ {};
    };
    let id = nextAuctionId;
    nextAuctionId += 1;
    let auction : Auction = {
      id;
      seller = caller;
      title;
      description;
      category;
      startingBid;
      currentHighestBid = startingBid;
      highestBidder = null;
      endTime;
      status = #Active;
      photoKey;
      bidCount = 0;
    };
    auctions.add(id, auction);
    id;
  };

  public query func getAuction(id : Nat) : async ?Auction {
    auctions.get(id);
  };

  public query func getActiveAuctions() : async [Auction] {
    var result : [Auction] = [];
    for ((_, a) in auctions.entries()) {
      if (a.status == #Active) {
        result := result.concat([a]);
      };
    };
    result;
  };

  public query func getAuctionsByCategory(category : Category) : async [Auction] {
    var result : [Auction] = [];
    for ((_, a) in auctions.entries()) {
      if (a.status == #Active and a.category == category) {
        result := result.concat([a]);
      };
    };
    result;
  };

  public query ({ caller }) func getMyAuctions() : async [Auction] {
    var result : [Auction] = [];
    for ((_, a) in auctions.entries()) {
      if (a.seller == caller) {
        result := result.concat([a]);
      };
    };
    result;
  };

  public shared ({ caller }) func cancelAuction(id : Nat) : async () {
    switch (auctions.get(id)) {
      case null Runtime.trap("Auction not found");
      case (?a) {
        let isAdmin = AccessControl.isAdmin(_accessControlState, caller);
        if (a.seller != caller and not isAdmin) {
          Runtime.trap("Unauthorized");
        };
        auctions.add(id, { a with status = #Cancelled });
      };
    };
  };

  // ---- Bidding ----
  public shared ({ caller }) func placeBid(auctionId : Nat, amount : Nat) : async () {
    let role = AccessControl.getUserRole(_accessControlState, caller);
    switch (role) {
      case (#guest) Runtime.trap("Must be registered to bid");
      case _ {};
    };
    switch (auctions.get(auctionId)) {
      case null Runtime.trap("Auction not found");
      case (?a) {
        if (a.status != #Active) Runtime.trap("Auction is not active");
        if (Time.now() > a.endTime) Runtime.trap("Auction has ended");
        if (amount <= a.currentHighestBid) Runtime.trap("Bid must exceed current highest bid");
        if (a.seller == caller) Runtime.trap("Seller cannot bid on own auction");
        let updatedAuction = {
          a with
          currentHighestBid = amount;
          highestBidder = ?caller;
          bidCount = a.bidCount + 1;
        };
        auctions.add(auctionId, updatedAuction);
        let bid : Bid = { bidder = caller; amount; timestamp = Time.now() };
        let existing = switch (bidHistory.get(auctionId)) {
          case (?bids) bids;
          case null [];
        };
        bidHistory.add(auctionId, existing.concat([bid]));
      };
    };
  };

  public query func getBidHistory(auctionId : Nat) : async [Bid] {
    switch (bidHistory.get(auctionId)) {
      case (?bids) bids;
      case null [];
    };
  };

  // ---- Admin ----
  public query ({ caller }) func adminGetAllAuctions() : async [Auction] {
    if (not AccessControl.isAdmin(_accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    var result : [Auction] = [];
    for ((_, a) in auctions.entries()) {
      result := result.concat([a]);
    };
    result;
  };
};
