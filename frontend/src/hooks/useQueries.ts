import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import type { PartnerProfile, PerformanceMetrics, PayoutRecord, ApprovalStatus, UserRole, Variant_pending_completed_failed } from '../backend';

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

// Partner Profile Queries
export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<PartnerProfile | null>({
    queryKey: ['callerProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerApprovalStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<ApprovalStatus>({
    queryKey: ['callerApprovalStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerApprovalStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PartnerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerPartner(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['callerApprovalStatus'] });
      toast.success('Registration submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });
}

// Partner Dashboard Queries
export function useGetPartnerDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['partnerDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartnerDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerPerformanceMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<PerformanceMetrics | null>({
    queryKey: ['callerPerformanceMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerPerformanceMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerPayoutRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<PayoutRecord[]>({
    queryKey: ['callerPayoutRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerPayoutRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestPayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestPayout(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerPayoutRecords'] });
      queryClient.invalidateQueries({ queryKey: ['partnerDashboard'] });
      toast.success('Payout request submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Payout request failed: ${error.message}`);
    },
  });
}

// Admin Queries
export function useGetAllPartnerApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allPartnerApprovals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPartnerApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPartners() {
  const { actor, isFetching } = useActor();

  return useQuery<PartnerProfile[]>({
    queryKey: ['allPartners'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPerformanceData() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, PerformanceMetrics][]>({
    queryKey: ['allPerformanceData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPerformanceData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayoutRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, PayoutRecord[]][]>({
    queryKey: ['allPayoutRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPayoutRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartnerApprovals'] });
      toast.success('Partner status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

export function useRecordClick() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordClick(partner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPerformanceData'] });
      toast.success('Click recorded successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record click: ${error.message}`);
    },
  });
}

export function useRecordConversion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partner, commission }: { partner: Principal; commission: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordConversion(partner, commission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPerformanceData'] });
      toast.success('Conversion recorded successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record conversion: ${error.message}`);
    },
  });
}

export function useUpdatePayoutStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partner, payoutIndex, status }: { partner: Principal; payoutIndex: bigint; status: Variant_pending_completed_failed }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePayoutStatus(partner, payoutIndex, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayoutRecords'] });
      toast.success('Payout status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payout status: ${error.message}`);
    },
  });
}
