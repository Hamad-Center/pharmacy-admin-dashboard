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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tenant, PaginatedResponse, TenantStatus, SubscriptionPlan } from '@/types/admin.types';
import { Plus, Search, MoreVertical, Edit, Trash, Pause, Play, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { InputDialog } from '@/components/dialogs/InputDialog';

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // Debounce search with 500ms delay
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'ALL'>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantForAction, setTenantForAction] = useState<Tenant | null>(null);
  const queryClient = useQueryClient();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: TenantStatus.ACTIVE,
    subscriptionPlan: SubscriptionPlan.FREE,
    billingEmail: '',
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({
    name: '',
    code: '',
    billingEmail: '',
  });

  // Edit form errors state
  const [editFormErrors, setEditFormErrors] = useState({
    name: '',
    billingEmail: '',
  });

  // Reset form when create dialog opens
  useEffect(() => {
    if (createDialogOpen) {
      setFormData({
        name: '',
        code: '',
        status: TenantStatus.ACTIVE,
        subscriptionPlan: SubscriptionPlan.FREE,
        billingEmail: '',
      });
      setFormErrors({ name: '', code: '', billingEmail: '' });
    }
  }, [createDialogOpen]);

  // Validation function for create form
  const validateForm = () => {
    const errors = { name: '', code: '', billingEmail: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Tenant name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Tenant name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.code.trim()) {
      errors.code = 'Tenant code is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(formData.code)) {
      errors.code = 'Code must contain only lowercase letters, numbers, and hyphens';
      isValid = false;
    } else if (formData.code.length < 3) {
      errors.code = 'Code must be at least 3 characters';
      isValid = false;
    }

    if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      errors.billingEmail = 'Please enter a valid email address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Validation function for edit form
  const validateEditForm = () => {
    const errors = { name: '', billingEmail: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Tenant name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Tenant name must be at least 2 characters';
      isValid = false;
    }

    if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      errors.billingEmail = 'Please enter a valid email address';
      isValid = false;
    }

    setEditFormErrors(errors);
    return isValid;
  };

  const { data, isLoading } = useQuery<PaginatedResponse<Tenant>>({
    queryKey: ['tenants', page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response = await api.get('/api/v1/admin/tenants', { params });
      return response.data;
    },
  });

  // Create tenant mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/api/v1/admin/tenants', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setCreateDialogOpen(false);
      setFormData({
        name: '',
        code: '',
        status: TenantStatus.ACTIVE,
        subscriptionPlan: SubscriptionPlan.FREE,
        billingEmail: '',
      });
      toast.success('Tenant created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create tenant');
    },
  });

  // Update tenant mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const response = await api.patch(`/api/v1/admin/tenants/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setEditDialogOpen(false);
      setSelectedTenant(null);
      toast.success('Tenant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update tenant');
    },
  });

  // Suspend tenant mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/api/v1/admin/tenants/${id}/suspend`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to suspend tenant');
    },
  });

  // Activate tenant mutation
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/v1/admin/tenants/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate tenant');
    },
  });

  // Delete tenant mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/v1/admin/tenants/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete tenant');
    },
  });

  const handleCreateTenant = () => {
    if (!validateForm()) {
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditTenant = () => {
    if (!selectedTenant) return;
    if (!validateEditForm()) {
      return;
    }
    updateMutation.mutate({ id: selectedTenant.id, data: formData });
  };

  const handleSuspendTenant = (tenant: Tenant) => {
    setTenantForAction(tenant);
    setSuspendDialogOpen(true);
  };

  const handleSuspendConfirm = (reason: string) => {
    if (tenantForAction) {
      suspendMutation.mutate({ id: tenantForAction.id, reason });
      setTenantForAction(null);
    }
  };

  const handleActivateTenant = (tenant: Tenant) => {
    setTenantForAction(tenant);
    setActivateDialogOpen(true);
  };

  const handleActivateConfirm = () => {
    if (tenantForAction) {
      activateMutation.mutate(tenantForAction.id);
      setTenantForAction(null);
    }
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    setTenantForAction(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tenantForAction) {
      deleteMutation.mutate(tenantForAction.id);
      setTenantForAction(null);
    }
  };

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      code: tenant.code,
      status: tenant.status,
      subscriptionPlan: tenant.subscriptionPlan,
      billingEmail: tenant.billingEmail || '',
    });
    setEditFormErrors({ name: '', billingEmail: '' });
    setEditDialogOpen(true);
  };

  const getStatusBadge = (status: TenantStatus) => {
    const variants: Record<TenantStatus, string> = {
      [TenantStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      [TenantStatus.SUSPENDED]: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      [TenantStatus.TRIAL]: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      [TenantStatus.INACTIVE]: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    };

    return (
      <Badge variant="outline" className={`${variants[status]} font-semibold capitalize transition-colors`}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Pharmacy Tenants
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Manage all pharmacy tenants and their subscriptions
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
              <DialogTitle className="text-xl">Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new pharmacy tenant to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Tenant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  placeholder="ABC Pharmacy"
                  className={`mt-1 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="code" className="text-sm font-medium">Tenant Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value });
                    if (formErrors.code) setFormErrors({ ...formErrors, code: '' });
                  }}
                  placeholder="abc-pharmacy"
                  className={`mt-1 ${formErrors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.code && <p className="text-xs text-red-600 mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <Label htmlFor="billingEmail" className="text-sm font-medium">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, billingEmail: e.target.value });
                    if (formErrors.billingEmail) setFormErrors({ ...formErrors, billingEmail: '' });
                  }}
                  placeholder="billing@abc-pharmacy.com"
                  className={`mt-1 ${formErrors.billingEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.billingEmail && <p className="text-xs text-red-600 mt-1">{formErrors.billingEmail}</p>}
              </div>
              <div>
                <Label htmlFor="plan" className="text-sm font-medium">Subscription Plan</Label>
                <Select
                  value={formData.subscriptionPlan}
                  onValueChange={(value) => setFormData({ ...formData, subscriptionPlan: value as SubscriptionPlan })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SubscriptionPlan.FREE}>Free</SelectItem>
                    <SelectItem value={SubscriptionPlan.BASIC}>Basic</SelectItem>
                    <SelectItem value={SubscriptionPlan.PROFESSIONAL}>Professional</SelectItem>
                    <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 mt-6">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTenant}
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Tenant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-blue-300 shadow-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TenantStatus | 'ALL')}>
          <SelectTrigger className="w-[200px] bg-white border-gray-200 shadow-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value={TenantStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={TenantStatus.TRIAL}>Trial</SelectItem>
            <SelectItem value={TenantStatus.SUSPENDED}>Suspended</SelectItem>
            <SelectItem value={TenantStatus.INACTIVE}>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <TableHead className="font-semibold text-gray-900">Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Code</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Plan</TableHead>
              <TableHead className="font-semibold text-gray-900">Created</TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((tenant) => (
              <TableRow key={tenant.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <TableCell className="font-semibold text-gray-900">{tenant.name}</TableCell>
                <TableCell className="text-gray-600 font-mono text-sm">{tenant.code}</TableCell>
                <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize font-medium">
                    {tenant.subscriptionPlan}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openEditDialog(tenant)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {tenant.status === TenantStatus.ACTIVE ? (
                        <DropdownMenuItem onClick={() => handleSuspendTenant(tenant)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleActivateTenant(tenant)}>
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteTenant(tenant)}
                        className="text-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader className="bg-gradient-to-r from-purple-50 to-pink-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl">Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium">Tenant Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (editFormErrors.name) setEditFormErrors({ ...editFormErrors, name: '' });
                }}
                className={`mt-1 ${editFormErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {editFormErrors.name && <p className="text-xs text-red-600 mt-1">{editFormErrors.name}</p>}
            </div>
            <div>
              <Label htmlFor="edit-billingEmail" className="text-sm font-medium">Billing Email</Label>
              <Input
                id="edit-billingEmail"
                type="email"
                value={formData.billingEmail}
                onChange={(e) => {
                  setFormData({ ...formData, billingEmail: e.target.value });
                  if (editFormErrors.billingEmail) setEditFormErrors({ ...editFormErrors, billingEmail: '' });
                }}
                className={`mt-1 ${editFormErrors.billingEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {editFormErrors.billingEmail && <p className="text-xs text-red-600 mt-1">{editFormErrors.billingEmail}</p>}
            </div>
            <div>
              <Label htmlFor="edit-plan" className="text-sm font-medium">Subscription Plan</Label>
              <Select
                value={formData.subscriptionPlan}
                onValueChange={(value) => setFormData({ ...formData, subscriptionPlan: value as SubscriptionPlan })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionPlan.FREE}>Free</SelectItem>
                  <SelectItem value={SubscriptionPlan.BASIC}>Basic</SelectItem>
                  <SelectItem value={SubscriptionPlan.PROFESSIONAL}>Professional</SelectItem>
                  <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditTenant}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Tenant Dialog */}
      <InputDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        title="Suspend Tenant"
        description={`Enter the reason for suspending "${tenantForAction?.name}"`}
        label="Suspension Reason"
        placeholder="e.g., Payment issues, Terms violation..."
        confirmLabel="Suspend Tenant"
        onConfirm={handleSuspendConfirm}
        isLoading={suspendMutation.isPending}
      />

      {/* Activate Tenant Dialog */}
      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Activate Tenant"
        description={`Are you sure you want to activate "${tenantForAction?.name}"? The tenant will regain full access to the platform.`}
        confirmLabel="Activate"
        onConfirm={handleActivateConfirm}
        isLoading={activateMutation.isPending}
        variant="default"
      />

      {/* Delete Tenant Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tenant"
        description={`Are you sure you want to delete "${tenantForAction?.name}"? This action cannot be undone and will permanently remove all tenant data.`}
        confirmLabel="Delete Tenant"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      {data && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-bold text-gray-900">{((page - 1) * 20) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * 20, data.meta.total)}</span> of <span className="font-bold text-gray-900">{data.meta.total}</span> tenants
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
