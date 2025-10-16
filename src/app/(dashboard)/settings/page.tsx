'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Shield, Bell, Key, Database, Settings as SettingsIcon, Loader2, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Account settings state
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Security settings state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    systemAlerts: true,
    tenantUpdates: false,
    userActivity: true,
  });

  // Fetch user profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/api/v1/auth/profile');
      return response.data;
    },
  });

  // Update account data when profile loads
  useEffect(() => {
    if (profileData) {
      setAccountData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
      });
      // Set notification preferences if they exist
      if (profileData.notificationSettings) {
        setNotifications(profileData.notificationSettings);
      }
    }
  }, [profileData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<typeof accountData>) => {
      const response = await api.patch('/api/v1/auth/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Account settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update account settings');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.post('/api/v1/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  // Update notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: typeof notifications) => {
      const response = await api.patch('/api/v1/auth/notification-settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Notification preferences updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update notification preferences');
    },
  });

  const handleAccountUpdate = () => {
    updateProfileMutation.mutate(accountData);
  };

  const handlePasswordChange = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!securityData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: securityData.currentPassword,
      newPassword: securityData.newPassword,
    });
  };

  const handleNotificationUpdate = () => {
    updateNotificationsMutation.mutate(notifications);
  };

  const isLoading = updateProfileMutation.isPending || changePasswordMutation.isPending || updateNotificationsMutation.isPending;

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative" />
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-50"></div>
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-blue-200 mt-1">Manage your account and system preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Account Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={accountData.firstName}
                onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                placeholder="John"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={accountData.lastName}
                onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                placeholder="Doe"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                placeholder="admin@pharmacy.com"
                disabled
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={accountData.phone}
                onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>User Type</Label>
              <div className="mt-2">
                <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 capitalize">
                  {profileData?.userType?.replace('_', ' ') || 'Loading...'}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Tenant</Label>
              <div className="mt-2">
                <Badge variant="outline" className="capitalize">
                  {profileData?.tenant?.name || 'System Admin'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleAccountUpdate}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            Security Settings
          </CardTitle>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-600 mt-0.5">Receive email updates about system events</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                className="ml-4"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-slate-900">System Alerts</p>
                <p className="text-sm text-slate-600 mt-0.5">Get notified about critical system issues</p>
              </div>
              <Switch
                checked={notifications.systemAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                className="ml-4"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-slate-900">Tenant Updates</p>
                <p className="text-sm text-slate-600 mt-0.5">Notifications when tenants are created or modified</p>
              </div>
              <Switch
                checked={notifications.tenantUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, tenantUpdates: checked })}
                className="ml-4"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-slate-900">User Activity</p>
                <p className="text-sm text-slate-600 mt-0.5">Get notified about important user actions</p>
              </div>
              <Switch
                checked={notifications.userActivity}
                onCheckedChange={(checked) => setNotifications({ ...notifications, userActivity: checked })}
                className="ml-4"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4">
            <Button
              onClick={handleNotificationUpdate}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {updateNotificationsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Key className="h-5 w-5 text-amber-600" />
            </div>
            API Configuration
          </CardTitle>
          <CardDescription>View and manage API settings</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <Label className="text-slate-700 font-medium">API Base URL</Label>
              <Input
                value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
                disabled
                className="mt-2 bg-white border-slate-300 font-mono text-sm"
              />
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <Label className="text-slate-700 font-medium">API Version</Label>
              <Input
                value="v1"
                disabled
                className="mt-2 bg-white border-slate-300 font-mono text-sm"
              />
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-blue-900">
                API configuration is managed through environment variables and cannot be changed from this interface.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Database className="h-5 w-5 text-emerald-600" />
            </div>
            System Information
          </CardTitle>
          <CardDescription>Platform details and version information</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Platform Version</p>
              <p className="text-lg font-semibold text-slate-900">1.0.0</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Environment</p>
              <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200">
                Production
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Last Updated</p>
              <p className="text-lg font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">System Status</p>
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                ● Operational
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
