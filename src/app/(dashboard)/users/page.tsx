'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, PaginatedResponse, UserType } from '@/types/admin.types';
import { Search, Lock, Unlock, Key, Activity, UserX, UserCheck, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { InputDialog } from '@/components/dialogs/InputDialog';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // Debounce search with 500ms delay
  const [tenantFilter, setTenantFilter] = useState<string>('ALL');
  const [userTypeFilter, setUserTypeFilter] = useState<UserType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [userForAction, setUserForAction] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form state for create user
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: UserType.PHARMACIST,
    roleId: UserType.PHARMACIST,
    tenantId: '',
    primaryPharmacyId: '',
    primaryBranchId: '',
    isActive: true,
    emailVerified: false,
    requirePasswordChange: true,
  });

  // Form errors state for create user
  const [createFormErrors, setCreateFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    tenantId: '',
  });

  // Form errors state for reset password
  const [resetPasswordError, setResetPasswordError] = useState('');

  // Reset form when create dialog opens
  useEffect(() => {
    if (createUserDialogOpen) {
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        userType: UserType.PHARMACIST,
        roleId: UserType.PHARMACIST,
        tenantId: '',
        primaryPharmacyId: '',
        primaryBranchId: '',
        isActive: true,
        emailVerified: false,
        requirePasswordChange: true,
      });
      setCreateFormErrors({
        name: '',
        email: '',
        password: '',
        tenantId: '',
      });
    }
  }, [createUserDialogOpen]);

  // Reset password field when reset password dialog opens
  useEffect(() => {
    if (resetPasswordDialogOpen && !selectedUser) {
      setNewPassword('');
      setResetPasswordError('');
    }
  }, [resetPasswordDialogOpen, selectedUser]);

  // Validation function for create user form
  const validateCreateUserForm = () => {
    const errors = {
      name: '',
      email: '',
      password: '',
      tenantId: '',
    };
    let isValid = true;

    if (!createFormData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (createFormData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!createFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!createFormData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (createFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(createFormData.password)) {
      errors.password = 'Password must include uppercase, lowercase, number & symbol';
      isValid = false;
    }

    if (!createFormData.tenantId) {
      errors.tenantId = 'Please select a tenant';
      isValid = false;
    }

    setCreateFormErrors(errors);
    return isValid;
  };

  // Validation function for reset password
  const validateResetPassword = () => {
    if (!newPassword) {
      setResetPasswordError('Password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setResetPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      setResetPasswordError('Password must include uppercase, lowercase, number & symbol');
      return false;
    }
    setResetPasswordError('');
    return true;
  };

  const { data, isLoading} = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page, debouncedSearch, tenantFilter, userTypeFilter, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      if (tenantFilter !== 'ALL') params.tenantId = tenantFilter;
      if (userTypeFilter !== 'ALL') params.userType = userTypeFilter;
      if (statusFilter !== 'ALL') params.isActive = statusFilter === 'ACTIVE';

      const response = await api.get('/api/v1/admin/users', { params });
      return response.data;
    },
  });

  // Fetch user activity
  const { data: activityData } = useQuery({
    queryKey: ['user-activity', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await api.get(`/api/v1/admin/users/${selectedUser.id}/activity`);
      return response.data;
    },
    enabled: !!selectedUser && activityDialogOpen,
  });

  // Fetch tenants for selection
  const { data: tenantsData } = useQuery({
    queryKey: ['tenants-list'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/tenants', { params: { page: 1, limit: 100 } });
      return response.data;
    },
  });

  // Fetch pharmacies for selection (filtered by tenant in create form)
  const { data: pharmaciesData } = useQuery({
    queryKey: ['pharmacies-for-user', createFormData.tenantId],
    queryFn: async () => {
      if (!createFormData.tenantId) return { data: [] };
      const response = await api.get('/api/v1/admin/pharmacies', {
        params: { tenantId: createFormData.tenantId }
      });
      return response.data;
    },
    enabled: !!createFormData.tenantId,
  });

  // Fetch branches for selection (filtered by pharmacy in create form)
  const { data: branchesData } = useQuery({
    queryKey: ['branches-for-user', createFormData.primaryPharmacyId],
    queryFn: async () => {
      if (!createFormData.primaryPharmacyId) return { data: [] };
      const response = await api.get('/api/v1/admin/branches', {
        params: { pharmacyId: createFormData.primaryPharmacyId }
      });
      return response.data;
    },
    enabled: !!createFormData.primaryPharmacyId,
  });

  // Fetch pharmacies for edit form (filtered by tenant)
  const { data: editPharmaciesData } = useQuery({
    queryKey: ['edit-pharmacies-for-user', editFormData?.tenantId],
    queryFn: async () => {
      if (!editFormData?.tenantId) return { data: [] };
      const response = await api.get('/api/v1/admin/pharmacies', {
        params: { tenantId: editFormData.tenantId }
      });
      return response.data;
    },
    enabled: !!editFormData?.tenantId && editDialogOpen,
  });

  // Fetch branches for edit form (filtered by pharmacy)
  const { data: editBranchesData } = useQuery({
    queryKey: ['edit-branches-for-user', editFormData?.primaryPharmacyId],
    queryFn: async () => {
      if (!editFormData?.primaryPharmacyId) return { data: [] };
      const response = await api.get('/api/v1/admin/branches', {
        params: { pharmacyId: editFormData.primaryPharmacyId }
      });
      return response.data;
    },
    enabled: !!editFormData?.primaryPharmacyId && editDialogOpen,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof createFormData) => {
      const response = await api.post('/api/v1/admin/users', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateUserDialogOpen(false);
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        userType: UserType.PHARMACIST,
        roleId: UserType.PHARMACIST,
        tenantId: '',
        primaryPharmacyId: '',
        primaryBranchId: '',
        isActive: true,
        emailVerified: false,
        requirePasswordChange: true,
      });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const response = await api.post(`/api/v1/admin/users/${id}/reset-password`, { newPassword: password });
      return response.data;
    },
    onSuccess: () => {
      setResetPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  // Activate user mutation
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/users/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/users/${id}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  // Lock user mutation
  const lockMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/api/v1/admin/users/${id}/lock`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User account locked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to lock user account');
    },
  });

  // Unlock user mutation
  const unlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/users/${id}/unlock`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User account unlocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unlock user account');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.put(`/api/v1/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditDialogOpen(false);
      setEditFormData(null);
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/v1/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialogOpen(false);
      setUserForAction(null);
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleCreateUser = () => {
    if (!validateCreateUserForm()) {
      return;
    }
    createUserMutation.mutate(createFormData);
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    if (!validateResetPassword()) {
      return;
    }
    resetPasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
  };

  const handleActivateUser = (user: User) => {
    setUserForAction(user);
    setActivateDialogOpen(true);
  };

  const handleActivateConfirm = () => {
    if (userForAction) {
      activateMutation.mutate(userForAction.id);
      setUserForAction(null);
    }
  };

  const handleDeactivateUser = (user: User) => {
    setUserForAction(user);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = () => {
    if (userForAction) {
      deactivateMutation.mutate(userForAction.id);
      setUserForAction(null);
    }
  };

  const handleLockUser = (user: User) => {
    setUserForAction(user);
    setLockDialogOpen(true);
  };

  const handleLockConfirm = (reason: string) => {
    if (userForAction) {
      lockMutation.mutate({ id: userForAction.id, reason });
      setUserForAction(null);
    }
  };

  const handleUnlockUser = (user: User) => {
    setUserForAction(user);
    setUnlockDialogOpen(true);
  };

  const handleUnlockConfirm = () => {
    if (userForAction) {
      unlockMutation.mutate(userForAction.id);
      setUserForAction(null);
    }
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const openActivityDialog = (user: User) => {
    setSelectedUser(user);
    setActivityDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditFormData(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editFormData) return;
    updateUserMutation.mutate({
      id: editFormData.id,
      data: {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        userType: editFormData.userType,
        roleId: editFormData.roleId,
        tenantId: editFormData.tenantId,
        primaryPharmacyId: editFormData.primaryPharmacyId,
        primaryBranchId: editFormData.primaryBranchId,
        isActive: editFormData.isActive,
        emailVerified: editFormData.emailVerified,
        requirePasswordChange: editFormData.requirePasswordChange,
      },
    });
  };

  const openDeleteDialog = (user: User) => {
    setUserForAction(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userForAction) {
      deleteUserMutation.mutate(userForAction.id);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge
        variant="outline"
        className={`font-semibold transition-colors ${
          isActive
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getLockedBadge = (user: User) => {
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-semibold transition-colors"
        >
          Locked
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage users across all pharmacy tenants
          </p>
        </div>

        <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg shadow-green-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
              <DialogTitle className="text-xl">Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={createFormData.name}
                  onChange={(e) => {
                    setCreateFormData({ ...createFormData, name: e.target.value });
                    if (createFormErrors.name) setCreateFormErrors({ ...createFormErrors, name: '' });
                  }}
                  placeholder="John Doe"
                  className={`mt-1 ${createFormErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {createFormErrors.name && <p className="text-xs text-red-600 mt-1">{createFormErrors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => {
                    setCreateFormData({ ...createFormData, email: e.target.value });
                    if (createFormErrors.email) setCreateFormErrors({ ...createFormErrors, email: '' });
                  }}
                  placeholder="john.doe@example.com"
                  className={`mt-1 ${createFormErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {createFormErrors.email && <p className="text-xs text-red-600 mt-1">{createFormErrors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => {
                    setCreateFormData({ ...createFormData, password: e.target.value });
                    if (createFormErrors.password) setCreateFormErrors({ ...createFormErrors, password: '' });
                  }}
                  placeholder="Min 8 characters"
                  className={`mt-1 ${createFormErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {createFormErrors.password ? (
                  <p className="text-xs text-red-600 mt-1">{createFormErrors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Min 8 chars with uppercase, lowercase, number & symbol</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  placeholder="+96599887766"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="userType">User Type *</Label>
                <Select
                  value={createFormData.userType}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, userType: value as UserType, roleId: value as UserType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserType.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={UserType.TENANT_ADMIN}>Tenant Admin</SelectItem>
                    <SelectItem value={UserType.PHARMACIST}>Pharmacist</SelectItem>
                    <SelectItem value={UserType.BRANCH_MANAGER}>Branch Manager</SelectItem>
                    <SelectItem value={UserType.ASSISTANT}>Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tenantId">Tenant *</Label>
                <Select
                  value={createFormData.tenantId}
                  onValueChange={(value) => {
                    setCreateFormData({ ...createFormData, tenantId: value, primaryPharmacyId: '', primaryBranchId: '' });
                    if (createFormErrors.tenantId) setCreateFormErrors({ ...createFormErrors, tenantId: '' });
                  }}
                >
                  <SelectTrigger className={`mt-1 ${createFormErrors.tenantId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantsData?.data?.map((tenant: any) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createFormErrors.tenantId && <p className="text-xs text-red-600 mt-1">{createFormErrors.tenantId}</p>}
              </div>

              <div>
                <Label htmlFor="primaryPharmacyId">Primary Pharmacy</Label>
                <Select
                  value={createFormData.primaryPharmacyId}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, primaryPharmacyId: value, primaryBranchId: '' })}
                  disabled={!createFormData.tenantId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={createFormData.tenantId ? "Select pharmacy" : "Select tenant first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmaciesData?.data?.map((pharmacy: any) => (
                      <SelectItem key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="primaryBranchId">Primary Branch</Label>
                <Select
                  value={createFormData.primaryBranchId}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, primaryBranchId: value })}
                  disabled={!createFormData.primaryPharmacyId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={createFormData.primaryPharmacyId ? "Select branch" : "Select pharmacy first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesData?.data?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={createFormData.isActive}
                    onChange={(e) => setCreateFormData({ ...createFormData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailVerified"
                    checked={createFormData.emailVerified}
                    onChange={(e) => setCreateFormData({ ...createFormData, emailVerified: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="emailVerified" className="cursor-pointer">Email Verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requirePasswordChange"
                    checked={createFormData.requirePasswordChange}
                    onChange={(e) => setCreateFormData({ ...createFormData, requirePasswordChange: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="requirePasswordChange" className="cursor-pointer">Require Password Change</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-blue-300 shadow-sm"
          />
        </div>

        <Select value={tenantFilter} onValueChange={(value) => setTenantFilter(value)}>
          <SelectTrigger className="w-[200px] bg-white border-gray-200 shadow-sm">
            <SelectValue placeholder="Filter by tenant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tenants</SelectItem>
            {tenantsData?.data?.map((tenant: any) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={userTypeFilter} onValueChange={(value) => setUserTypeFilter(value as UserType | 'ALL')}>
          <SelectTrigger className="w-[200px] bg-white border-gray-200 shadow-sm">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value={UserType.SUPER_ADMIN}>Super Admin</SelectItem>
            <SelectItem value={UserType.PHARMACIST}>Pharmacist</SelectItem>
            <SelectItem value={UserType.TENANT_ADMIN}>Tenant Admin</SelectItem>
            <SelectItem value={UserType.BRANCH_MANAGER}>Branch Manager</SelectItem>
            <SelectItem value={UserType.ASSISTANT}>Assistant</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}>
          <SelectTrigger className="w-[200px] bg-white border-gray-200 shadow-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <TableHead className="font-semibold text-gray-900">Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Email</TableHead>
              <TableHead className="font-semibold text-gray-900">Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Tenant</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Last Login</TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <TableCell className="font-semibold text-gray-900">
                  {user.name}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize font-medium">
                    {user.userType.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{user.tenant?.name || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.isActive)}
                    {getLockedBadge(user)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openActivityDialog(user)} title="View Activity">
                      <Activity className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openResetPasswordDialog(user)} title="Reset Password">
                      <Key className="h-4 w-4" />
                    </Button>
                    {user.isActive ? (
                      <Button variant="ghost" size="sm" onClick={() => handleDeactivateUser(user)} title="Deactivate">
                        <UserX className="h-4 w-4 text-orange-600" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleActivateUser(user)} title="Activate">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {user.lockedUntil && new Date(user.lockedUntil) > new Date() ? (
                      <Button variant="ghost" size="sm" onClick={() => handleUnlockUser(user)} title="Unlock">
                        <Unlock className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleLockUser(user)} title="Lock">
                        <Lock className="h-4 w-4 text-yellow-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(user)} title="Delete">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl">Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (resetPasswordError) setResetPasswordError('');
                }}
                placeholder="Min 8 characters"
                className={`mt-1 ${resetPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {resetPasswordError ? (
                <p className="text-xs text-red-600 mt-1">{resetPasswordError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Min 8 chars with uppercase, lowercase, number & symbol</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 mt-6">
            <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending || !newPassword}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl">User Activity</DialogTitle>
            <DialogDescription>
              Activity history for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {activityData?.data?.length > 0 ? (
              activityData.data.map((activity: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">{JSON.stringify(activity.details)}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No activity found</p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setActivityDialogOpen(false)}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate User Dialog */}
      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Activate User"
        description={`Are you sure you want to activate "${userForAction?.name}"? This will restore the user's access to the platform.`}
        confirmLabel="Activate"
        onConfirm={handleActivateConfirm}
        isLoading={activateMutation.isPending}
        variant="default"
      />

      {/* Deactivate User Dialog */}
      <ConfirmDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        title="Deactivate User"
        description={`Are you sure you want to deactivate "${userForAction?.name}"? The user will lose access to the platform.`}
        confirmLabel="Deactivate"
        onConfirm={handleDeactivateConfirm}
        isLoading={deactivateMutation.isPending}
        variant="danger"
      />

      {/* Lock User Dialog */}
      <InputDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        title="Lock User Account"
        description={`Enter the reason for locking "${userForAction?.name}'s" account`}
        label="Lock Reason"
        placeholder="e.g., Security concern, Policy violation..."
        confirmLabel="Lock Account"
        onConfirm={handleLockConfirm}
        isLoading={lockMutation.isPending}
      />

      {/* Unlock User Dialog */}
      <ConfirmDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        title="Unlock User Account"
        description={`Are you sure you want to unlock "${userForAction?.name}'s" account? The user will regain access to the platform.`}
        confirmLabel="Unlock"
        onConfirm={handleUnlockConfirm}
        isLoading={unlockMutation.isPending}
        variant="default"
      />

      {/* Delete User Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${userForAction?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteUserMutation.isPending}
        variant="danger"
      />

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl">Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+96599887766"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-userType">User Type</Label>
                <Select
                  value={editFormData.userType}
                  onValueChange={(value) => setEditFormData({ ...editFormData, userType: value as UserType, roleId: value as UserType })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserType.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={UserType.TENANT_ADMIN}>Tenant Admin</SelectItem>
                    <SelectItem value={UserType.PHARMACIST}>Pharmacist</SelectItem>
                    <SelectItem value={UserType.BRANCH_MANAGER}>Branch Manager</SelectItem>
                    <SelectItem value={UserType.ASSISTANT}>Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-tenant">Tenant</Label>
                <Select
                  value={editFormData.tenantId}
                  onValueChange={(value) => setEditFormData({ ...editFormData, tenantId: value, primaryPharmacyId: '', primaryBranchId: '' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantsData?.data?.map((tenant: any) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-primaryPharmacyId">Primary Pharmacy</Label>
                <Select
                  value={editFormData.primaryPharmacyId || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, primaryPharmacyId: value, primaryBranchId: '' })}
                  disabled={!editFormData.tenantId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={editFormData.tenantId ? "Select pharmacy" : "Select tenant first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {editPharmaciesData?.data?.map((pharmacy: any) => (
                      <SelectItem key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-primaryBranchId">Primary Branch</Label>
                <Select
                  value={editFormData.primaryBranchId || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, primaryBranchId: value })}
                  disabled={!editFormData.primaryPharmacyId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={editFormData.primaryPharmacyId ? "Select branch" : "Select pharmacy first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {editBranchesData?.data?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={editFormData.isActive ?? true}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-isActive" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-emailVerified"
                    checked={editFormData.emailVerified ?? false}
                    onChange={(e) => setEditFormData({ ...editFormData, emailVerified: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-emailVerified" className="cursor-pointer">Email Verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-requirePasswordChange"
                    checked={editFormData.requirePasswordChange ?? false}
                    onChange={(e) => setEditFormData({ ...editFormData, requirePasswordChange: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-requirePasswordChange" className="cursor-pointer">Require Password Change</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {data && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-bold text-gray-900">{((page - 1) * 20) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * 20, data.meta.total)}</span> of <span className="font-bold text-gray-900">{data.meta.total}</span> users
          </p>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm font-medium bg-white rounded-lg border border-gray-200 shadow-sm">
              Page <span className="font-bold text-blue-600">{page}</span> of <span className="font-bold">{data.meta.totalPages}</span>
            </span>
            <Button
              variant="outline"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
