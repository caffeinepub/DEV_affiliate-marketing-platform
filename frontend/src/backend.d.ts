import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface PayoutRecord {
    status: Variant_pending_completed_failed;
    amount: number;
    payoutDate: Time;
}
export interface PerformanceMetrics {
    clicks: bigint;
    lastUpdated: Time;
    commissionEarned: number;
    conversions: bigint;
}
export interface PartnerProfile {
    contactName: string;
    businessName: string;
    email: string;
    website: string;
    applicationDate: Time;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_completed_failed {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export interface backendInterface {
    approvePartner(partner: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllPartnerApprovals(): Promise<Array<UserApprovalInfo>>;
    getAllPartners(): Promise<Array<PartnerProfile>>;
    getAllPayoutRecords(): Promise<Array<[Principal, Array<PayoutRecord>]>>;
    getAllPerformanceData(): Promise<Array<[Principal, PerformanceMetrics]>>;
    getCallerApprovalStatus(): Promise<ApprovalStatus>;
    getCallerPayoutRecords(): Promise<Array<PayoutRecord>>;
    getCallerPerformanceMetrics(): Promise<PerformanceMetrics | null>;
    getCallerProfile(): Promise<PartnerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPartnerApprovalStatus(partner: Principal): Promise<ApprovalStatus>;
    getPartnerDashboard(): Promise<{
        metrics: PerformanceMetrics;
        approvalStatus: ApprovalStatus;
        payouts: Array<PayoutRecord>;
        profile: PartnerProfile;
    }>;
    getPartnerProfile(partner: Principal): Promise<PartnerProfile>;
    getPayoutRecords(partner: Principal): Promise<Array<PayoutRecord>>;
    getPerformanceMetrics(partner: Principal): Promise<PerformanceMetrics>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    recordClick(partner: Principal): Promise<void>;
    recordConversion(partner: Principal, commission: number): Promise<void>;
    registerPartner(profile: PartnerProfile): Promise<void>;
    rejectPartner(partner: Principal): Promise<void>;
    requestApproval(): Promise<void>;
    requestPayout(amount: number): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updatePayoutStatus(partner: Principal, payoutIndex: bigint, status: Variant_pending_completed_failed): Promise<void>;
}
