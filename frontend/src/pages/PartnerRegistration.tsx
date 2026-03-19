import { useState } from 'react';
import { useRegisterPartner } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

export default function PartnerRegistration() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    website: '',
  });

  const registerMutation = useRegisterPartner();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      ...formData,
      applicationDate: BigInt(Date.now()) * BigInt(1_000_000),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isFormValid = formData.businessName && formData.contactName && formData.email && formData.website;

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Partner Registration</CardTitle>
          <CardDescription>
            Apply to become an affiliate partner. Our team will review your application and get back to you shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Your Company LLC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL *</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
