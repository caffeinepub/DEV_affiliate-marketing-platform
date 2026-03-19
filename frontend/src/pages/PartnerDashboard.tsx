import { useGetPartnerDashboard, useRequestPayout } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { TrendingUp, MousePointerClick, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import { Variant_pending_completed_failed } from '../backend';
import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export default function PartnerDashboard() {
  const { data: dashboard, isLoading } = useGetPartnerDashboard();
  const requestPayoutMutation = useRequestPayout();
  const [payoutAmount, setPayoutAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container py-16">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Not Available</CardTitle>
            <CardDescription>Unable to load dashboard data.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { profile, metrics, payouts } = dashboard;
  const conversionRate = Number(metrics.clicks) > 0 
    ? ((Number(metrics.conversions) / Number(metrics.clicks)) * 100).toFixed(2)
    : '0.00';

  const handleRequestPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (amount > 0 && amount <= metrics.commissionEarned) {
      requestPayoutMutation.mutate(amount);
      setPayoutAmount('');
      setDialogOpen(false);
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

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.contactName}!</h1>
        <p className="text-muted-foreground">{profile.businessName}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.clicks.toString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Affiliate link clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.conversions.toString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Click to conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${metrics.commissionEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Commission earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>View and request payouts for your earnings</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={metrics.commissionEarned <= 0}>
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>
                    Available balance: ${metrics.commissionEarned.toFixed(2)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payout Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={metrics.commissionEarned}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleRequestPayout}
                    disabled={
                      !payoutAmount ||
                      parseFloat(payoutAmount) <= 0 ||
                      parseFloat(payoutAmount) > metrics.commissionEarned ||
                      requestPayoutMutation.isPending
                    }
                  >
                    {requestPayoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payout requests yet. Start earning commissions to request payouts!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(Number(payout.payoutDate) / 1_000_000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium">{profile.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Name</p>
              <p className="font-medium">{profile.contactName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                {profile.website}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
