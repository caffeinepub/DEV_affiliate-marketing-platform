import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize access control and approval state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  // Partner Profile Type
  public type PartnerProfile = {
    businessName : Text;
    contactName : Text;
    email : Text;
    website : Text;
    applicationDate : Time.Time;
  };

  // Performance Metrics Type
  public type PerformanceMetrics = {
    clicks : Nat;
    conversions : Nat;
    commissionEarned : Float;
    lastUpdated : Time.Time;
  };

  // Payout Record Type
  public type PayoutRecord = {
    amount : Float;
    payoutDate : Time.Time;
    status : {
      #pending;
      #completed;
      #failed;
    };
  };

  // Internal Data Stores
  let partnerProfiles = Map.empty<Principal, PartnerProfile>();
  let performanceData = Map.empty<Principal, PerformanceMetrics>();
  let payoutRecords = Map.empty<Principal, [PayoutRecord]>();

  // User Approval Functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Partner Registration
  public shared ({ caller }) func registerPartner(profile : PartnerProfile) : async () {
    if (partnerProfiles.containsKey(caller)) {
      Runtime.trap("Partner already registered");
    };
    partnerProfiles.add(caller, profile);
    performanceData.add(
      caller,
      {
        clicks = 0;
        conversions = 0;
        commissionEarned = 0.0;
        lastUpdated = Time.now();
      },
    );
  };

  // Get Partner Profile
  public query ({ caller }) func getPartnerProfile(partner : Principal) : async PartnerProfile {
    if (caller != partner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    switch (partnerProfiles.get(partner)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?profile) { profile };
    };
  };

  // Get Performance Metrics
  public query ({ caller }) func getPerformanceMetrics(partner : Principal) : async PerformanceMetrics {
    if (caller != partner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own metrics or be an admin");
    };
    switch (performanceData.get(partner)) {
      case (null) { Runtime.trap("Performance data not found") };
      case (?metrics) { metrics };
    };
  };

  // Record Click (Admin only - system operation)
  public shared ({ caller }) func recordClick(partner : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record clicks");
    };
    if (not UserApproval.isApproved(approvalState, partner)) {
      Runtime.trap("Partner must be approved to record clicks");
    };
    switch (performanceData.get(partner)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?metrics) {
        let updatedMetrics = {
          clicks = metrics.clicks + 1;
          conversions = metrics.conversions;
          commissionEarned = metrics.commissionEarned;
          lastUpdated = Time.now();
        };
        performanceData.add(partner, updatedMetrics);
      };
    };
  };

  // Record Conversion (Admin only - system operation)
  public shared ({ caller }) func recordConversion(partner : Principal, commission : Float) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record conversions");
    };
    if (not UserApproval.isApproved(approvalState, partner)) {
      Runtime.trap("Partner must be approved to record conversions");
    };
    switch (performanceData.get(partner)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?metrics) {
        let updatedMetrics = {
          clicks = metrics.clicks;
          conversions = metrics.conversions + 1;
          commissionEarned = metrics.commissionEarned + commission;
          lastUpdated = Time.now();
        };
        performanceData.add(partner, updatedMetrics);
      };
    };
  };

  // Request Payout
  public shared ({ caller }) func requestPayout(amount : Float) : async () {
    if (not UserApproval.isApproved(approvalState, caller)) {
      Runtime.trap("Unauthorized: Only approved partners can request payouts");
    };
    let newPayout : PayoutRecord = {
      amount;
      payoutDate = Time.now();
      status = #pending;
    };
    let existingPayouts = switch (payoutRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
    payoutRecords.add(caller, existingPayouts.concat([newPayout]));
  };

  // Get Payout Records
  public query ({ caller }) func getPayoutRecords(partner : Principal) : async [PayoutRecord] {
    if (caller != partner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payout records or be an admin");
    };
    switch (payoutRecords.get(partner)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  // Admin: Approve Partner
  public shared ({ caller }) func approvePartner(partner : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve partners");
    };
    UserApproval.setApproval(approvalState, partner, #approved);
  };

  // Admin: Reject Partner
  public shared ({ caller }) func rejectPartner(partner : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject partners");
    };
    UserApproval.setApproval(approvalState, partner, #rejected);
  };

  // Admin: Get All Partners
  public query ({ caller }) func getAllPartners() : async [PartnerProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all partners");
    };
    partnerProfiles.values().toArray();
  };

  // Admin: Get All Performance Data
  public query ({ caller }) func getAllPerformanceData() : async [(Principal, PerformanceMetrics)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all performance data");
    };
    performanceData.toArray();
  };

  // Admin: Update Payout Status
  public shared ({ caller }) func updatePayoutStatus(partner : Principal, payoutIndex : Nat, status : { #pending; #completed; #failed }) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update payout status");
    };
    switch (payoutRecords.get(partner)) {
      case (null) { Runtime.trap("No payout records found for partner") };
      case (?records) {
        if (payoutIndex >= records.size()) {
          Runtime.trap("Invalid payout index");
        };
        let updatedRecords = Array.tabulate(
          records.size(),
          func(i) {
            if (i == payoutIndex) {
              {
                amount = records[i].amount;
                payoutDate = records[i].payoutDate;
                status;
              };
            } else {
              records[i];
            };
          },
        );
        payoutRecords.add(partner, updatedRecords);
      };
    };
  };

  // Admin: Get All Payout Records
  public query ({ caller }) func getAllPayoutRecords() : async [(Principal, [PayoutRecord])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payout records");
    };
    payoutRecords.toArray();
  };

  // Admin: Get Partner Approval Status
  public query ({ caller }) func getPartnerApprovalStatus(partner : Principal) : async UserApproval.ApprovalStatus {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view approval status");
    };
    switch (UserApproval.listApprovals(approvalState).find(func(info) { info.principal == partner })) {
      case (null) { Runtime.trap("Partner not found") };
      case (?info) { info.status };
    };
  };

  // Admin: Get All Partner Approvals
  public query ({ caller }) func getAllPartnerApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all approvals");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Get Partner Dashboard Data (Own data only)
  public query ({ caller }) func getPartnerDashboard() : async {
    profile : PartnerProfile;
    metrics : PerformanceMetrics;
    payouts : [PayoutRecord];
    approvalStatus : UserApproval.ApprovalStatus;
  } {
    if (not UserApproval.isApproved(approvalState, caller)) {
      Runtime.trap("Unauthorized: Only approved partners can access dashboard");
    };
    let profile = switch (partnerProfiles.get(caller)) {
      case (null) { Runtime.trap("Partner profile not found") };
      case (?p) { p };
    };
    let metrics = switch (performanceData.get(caller)) {
      case (null) { Runtime.trap("Performance data not found") };
      case (?m) { m };
    };
    let payouts = switch (payoutRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
    let approvalStatus = switch (UserApproval.listApprovals(approvalState).find(func(info) { info.principal == caller })) {
      case (null) { #pending };
      case (?info) { info.status };
    };
    {
      profile;
      metrics;
      payouts;
      approvalStatus;
    };
  };

  // Get Caller's Approval Status
  public query ({ caller }) func getCallerApprovalStatus() : async UserApproval.ApprovalStatus {
    switch (UserApproval.listApprovals(approvalState).find(func(info) { info.principal == caller })) {
      case (null) { #pending };
      case (?info) { info.status };
    };
  };

  // Get Caller's Profile
  public query ({ caller }) func getCallerProfile() : async ?PartnerProfile {
    partnerProfiles.get(caller);
  };

  // Get Caller's Performance Metrics
  public query ({ caller }) func getCallerPerformanceMetrics() : async ?PerformanceMetrics {
    if (not UserApproval.isApproved(approvalState, caller)) {
      Runtime.trap("Unauthorized: Only approved partners can view performance metrics");
    };
    performanceData.get(caller);
  };

  // Get Caller's Payout Records
  public query ({ caller }) func getCallerPayoutRecords() : async [PayoutRecord] {
    if (not UserApproval.isApproved(approvalState, caller)) {
      Runtime.trap("Unauthorized: Only approved partners can view payout records");
    };
    switch (payoutRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
  };
};
