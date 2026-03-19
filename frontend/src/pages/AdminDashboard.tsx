import { useState } from 'react';
import { useGetAllPartnerApprovals, useGetAllPerformanceData, useGetAllPayoutRecords, useSetApproval, useRecordClick, useRecordConversion, useUpdatePayoutStatus } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ApprovalStatus, Variant_pending_completed_failed } from '../backend';
import { Principal } from '@dfinity/principal';
import { Loader2, Users, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function AdminDashboard() {
  const { data: approvals, isLoading: approvalsLoading } = useGetAllPartnerApprovals();
  const { data: performanceData, isLoading: performanceLoading } = useGetAllPerformanceData();
  const { data: payoutRecords, isLoading: payoutsLoading } = useGetAllPayoutRecords();
  const setApprovalMutation = useSetApproval();
  const recordClickMutation = useRecordClick();
  const recordConversionMutation = useRecordConversion();
  const updatePayoutMutation = useUpdatePayoutStatus();

  const [clickDialogOpen, setClickDialogOpen] = useState(false);
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Principal | null>(null);
  const [commissionAmount, setCommissionAmount] = useState('');

  const handleApprove = (principal: Principal) => {
    setApprovalMutation.mutate({ user: principal, status: ApprovalStatus.approved });
  };

  const handleReject = (principal: Principal) => {
    setApprovalMutation.mutate({ user: principal, status: ApprovalStatus.rejected });
  };

  const handleRecordClick = () => {
    if (selectedPartner) {
      recordClickMutation.mutate(selectedPartner);
      setClickDialogOpen(false);
      setSelectedPartner(null);
    }
  };

  const handleRecordConversion = () => {
    if (selectedPartner && commissionAmount) {
      recordConversionMutation.mutate({
        partner: selectedPartner,
        commission: parseFloat(commissionAmount),
      });
      setConversionDialogOpen(false);
      setSelectedPartner(null);
      setCommissionAmount('');
    }
  };

  const handleUpdatePayoutStatus = (partner: Principal, index: number, status: Variant_pending_completed_failed) => {
    updatePayoutMutation.mutate({
      partner,
      payoutIndex: BigInt(index),
      status,
    });
  };

  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.approved:
        return <Badge variant="default">Approved</Badge>;
      case ApprovalStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPayoutStatusBadge = (status: Variant_pending_completed_failed) => {
    switch (status) {
      case Variant_pending_completed_failed.completed:
        return <Badge variant="default">Completed</Badge>;
      case Variant_pending_completed_failed.failed:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  // Calculate summary stats
  const totalPartners = approvals?.length || 0;
  const approvedPartners = approvals?.filter(a => a.status === ApprovalStatus.approved).length || 0;
  const totalClicks = performanceData?.reduce((sum, [_, metrics]) => sum + Number(metrics.clicks), 0) || 0;
  const totalConversions = performanceData?.reduce((sum, [_, metrics]) => sum + Number(metrics.conversions), 0) || 0;
  const totalCommissions = performanceData?.reduce((sum, [_, metrics]) => sum + metrics.commissionEarned, 0) || 0;
  const pendingPayouts = payoutRecords?.reduce((sum, [_, records]) => 
    sum + records.filter(r => r.status === Variant_pending_completed_failed.pending).length, 0) || 0;

  if (approvalsLoading || performanceLoading || payoutsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage partners, track performance, and process payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground mt-1">{approvedPartners} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalConversions} conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingPayouts}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approvals">Partner Approvals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Partner Applications</CardTitle>
              <CardDescription>Review and approve partner applications</CardDescription>
            </CardHeader>
            <CardContent>
              {!approvals || approvals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No partner applications yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.principal.toString()}>
                        <TableCell className="font-mono text-xs">
                          {approval.principal.toString().slice(0, 20)}...
                        </TableCell>
                        <TableCell>{getApprovalBadge(approval.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {approval.status !== ApprovalStatus.approved && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(approval.principal)}
                                disabled={setApprovalMutation.isPending}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                            )}
                            {approval.status !== ApprovalStatus.rejected && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(approval.principal)}
                                disabled={setApprovalMutation.isPending}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Partner Performance</CardTitle>
              <CardDescription>Track clicks, conversions, and commissions</CardDescription>
            </CardHeader>
            <CardContent>
              {!performanceData || performanceData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No performance data available yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner ID</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.map(([principal, metrics]) => (
                      <TableRow key={principal.toString()}>
                        <TableCell className="font-mono text-xs">
                          {principal.toString().slice(0, 20)}...
                        </TableCell>
                        <TableCell>{metrics.clicks.toString()}</TableCell>
                        <TableCell>{metrics.conversions.toString()}</TableCell>
                        <TableCell className="font-medium">${metrics.commissionEarned.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={clickDialogOpen && selectedPartner?.toString() === principal.toString()} onOpenChange={setClickDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedPartner(principal)}>
                                  + Click
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Record Click</DialogTitle>
                                  <DialogDescription>
                                    Record a click for this partner
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button onClick={handleRecordClick} disabled={recordClickMutation.isPending}>
                                    {recordClickMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Recording...
                                      </>
                                    ) : (
                                      'Record Click'
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog open={conversionDialogOpen && selectedPartner?.toString() === principal.toString()} onOpenChange={setConversionDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedPartner(principal)}>
                                  + Conversion
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Record Conversion</DialogTitle>
                                  <DialogDescription>
                                    Record a conversion and commission for this partner
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="commission">Commission Amount</Label>
                                    <Input
                                      id="commission"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={commissionAmount}
                                      onChange={(e) => setCommissionAmount(e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={handleRecordConversion}
                                    disabled={!commissionAmount || parseFloat(commissionAmount) <= 0 || recordConversionMutation.isPending}
                                  >
                                    {recordConversionMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Recording...
                                      </>
                                    ) : (
                                      'Record Conversion'
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout Management</CardTitle>
              <CardDescription>Process partner payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              {!payoutRecords || payoutRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payout requests yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRecords.flatMap(([principal, records]) =>
                      records.map((record, index) => (
                        <TableRow key={`${principal.toString()}-${index}`}>
                          <TableCell className="font-mono text-xs">
                            {principal.toString().slice(0, 20)}...
                          </TableCell>
                          <TableCell className="font-medium">${record.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {new Date(Number(record.payoutDate) / 1_000_000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getPayoutStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.status === Variant_pending_completed_failed.pending && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdatePayoutStatus(principal, index, Variant_pending_completed_failed.completed)}
                                  disabled={updatePayoutMutation.isPending}
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdatePayoutStatus(principal, index, Variant_pending_completed_failed.failed)}
                                  disabled={updatePayoutMutation.isPending}
                                >
                                  Fail
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
