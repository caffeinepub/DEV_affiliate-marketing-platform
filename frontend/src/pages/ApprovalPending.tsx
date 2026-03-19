import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ApprovalStatus } from '../backend';

interface ApprovalPendingProps {
  status?: ApprovalStatus;
}

export default function ApprovalPending({ status }: ApprovalPendingProps) {
  const getStatusConfig = () => {
    switch (status) {
      case ApprovalStatus.approved:
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: 'Application Approved',
          description: 'Your partner application has been approved! Refreshing...',
          badgeVariant: 'default' as const,
          badgeText: 'Approved',
        };
      case ApprovalStatus.rejected:
        return {
          icon: <XCircle className="h-16 w-16 text-destructive" />,
          title: 'Application Rejected',
          description: 'Unfortunately, your application was not approved at this time. Please contact support for more information.',
          badgeVariant: 'destructive' as const,
          badgeText: 'Rejected',
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-chart-1" />,
          title: 'Application Under Review',
          description: 'Thank you for submitting your application. Our team is reviewing it and will get back to you soon.',
          badgeVariant: 'secondary' as const,
          badgeText: 'Pending',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{config.icon}</div>
          <div className="flex justify-center mb-4">
            <Badge variant={config.badgeVariant}>{config.badgeText}</Badge>
          </div>
          <CardTitle className="text-3xl">{config.title}</CardTitle>
          <CardDescription className="text-base">{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-6 space-y-2">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Our team reviews all applications within 24-48 hours</li>
              <li>• You'll receive an email notification once a decision is made</li>
              <li>• Approved partners gain immediate access to the dashboard</li>
              <li>• You can start tracking performance and earning commissions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
