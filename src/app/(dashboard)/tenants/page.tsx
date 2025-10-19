'use client';

import { useState } from 'react';
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
import {
  Tenant,
  PaginatedResponse,
  TenantStatus,
  TenantType,
  SubscriptionPlan,
  CreateTenantDto,
} from '@/types/admin.types';
import { Building2, MoreHorizontal, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Form state
  const [formData, setFormData] = useState<CreateTenantDto>({
    name: '',
    code: '',
    type: TenantType.INDEPENDENT,
    subscriptionPlan: SubscriptionPlan.STARTER,
    billingEmail: '',
    maxPharmacies: 1,
    maxBranchesPerPharmacy: 5,
    maxUsers: 20,
  });

  // Fetch tenants
  const { data, isLoading } = useQuery<PaginatedResponse<Tenant>>({
    queryKey: ['tenants', debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);

      const response = await api.get(`/api/v1/admin/tenants?${params.toString()}`);
      return response.data;
    },
  });

  // Create tenant mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      // Remove empty optional fields
      const submitData = { ...data };
      if (!submitData.billingEmail) delete submitData.billingEmail;
      if (!submitData.maxPharmacies) delete submitData.maxPharmacies;
      if (!submitData.maxBranchesPerPharmacy) delete submitData.maxBranchesPerPharmacy;
      if (!submitData.maxUsers) delete submitData.maxUsers;

      const response = await api.post('/api/v1/admin/tenants', submitData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Tenant created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create tenant';
      toast.error(message);
    },
  });

  // Suspend tenant mutation
  const suspendMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/v1/admin/tenants/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant suspended successfully');
    },
    onError: () => {
      toast.error('Failed to suspend tenant');
    },
  });

  // Activate tenant mutation
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/v1/admin/tenants/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant activated successfully');
    },
    onError: () => {
      toast.error('Failed to activate tenant');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: TenantType.INDEPENDENT,
      subscriptionPlan: SubscriptionPlan.STARTER,
      billingEmail: '',
      maxPharmacies: 1,
      maxBranchesPerPharmacy: 5,
      maxUsers: 20,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: TenantStatus) => {
    const variants: Record<TenantStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      [TenantStatus.ACTIVE]: { variant: 'default', label: 'Active' },
      [TenantStatus.INACTIVE]: { variant: 'secondary', label: 'Inactive' },
      [TenantStatus.SUSPENDED]: { variant: 'destructive', label: 'Suspended' },
      [TenantStatus.TRIAL]: { variant: 'outline', label: 'Trial' },
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage pharmacy organizations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>
                  Create a new pharmacy organization. You can add pharmacies, branches, and users after creation.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Basic Information</h3>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">
                          Tenant Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Al Nahda Pharmacy"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="code">
                          Tenant Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="code"
                          placeholder="e.g., alnahda (lowercase, no spaces)"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, '') })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Used for URLs and identification</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">
                            Tenant Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as TenantType })}
                          >
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TenantType.INDEPENDENT}>Independent Pharmacy</SelectItem>
                              <SelectItem value={TenantType.CHAIN}>Pharmacy Chain</SelectItem>
                              <SelectItem value={TenantType.FRANCHISE}>Franchise</SelectItem>
                              <SelectItem value={TenantType.ENTERPRISE}>Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="subscriptionPlan">
                            Subscription Plan <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.subscriptionPlan}
                            onValueChange={(value) => setFormData({ ...formData, subscriptionPlan: value as SubscriptionPlan })}
                          >
                            <SelectTrigger id="subscriptionPlan">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SubscriptionPlan.STARTER}>Starter</SelectItem>
                              <SelectItem value={SubscriptionPlan.PROFESSIONAL}>Professional</SelectItem>
                              <SelectItem value={SubscriptionPlan.ENTERPRISE}>Enterprise</SelectItem>
                              <SelectItem value={SubscriptionPlan.CUSTOM}>Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-sm">Optional Settings</h3>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="billingEmail">Billing Email</Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          placeholder="billing@pharmacy.com"
                          value={formData.billingEmail}
                          onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="maxPharmacies">Max Pharmacies</Label>
                          <Input
                            id="maxPharmacies"
                            type="number"
                            min="1"
                            value={formData.maxPharmacies}
                            onChange={(e) => setFormData({ ...formData, maxPharmacies: parseInt(e.target.value) || 1 })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="maxBranches">Max Branches</Label>
                          <Input
                            id="maxBranches"
                            type="number"
                            min="1"
                            value={formData.maxBranchesPerPharmacy}
                            onChange={(e) => setFormData({ ...formData, maxBranchesPerPharmacy: parseInt(e.target.value) || 5 })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="maxUsers">Max Users</Label>
                          <Input
                            id="maxUsers"
                            type="number"
                            min="1"
                            value={formData.maxUsers}
                            onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 20 })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Tenant'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value={TenantStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={TenantStatus.INACTIVE}>Inactive</SelectItem>
            <SelectItem value={TenantStatus.SUSPENDED}>Suspended</SelectItem>
            <SelectItem value={TenantStatus.TRIAL}>Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Table */}
      <div className="border rounded-lg bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading tenants...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No tenants found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">{tenant.code}</code>
                  </TableCell>
                  <TableCell className="capitalize">{tenant.type.toLowerCase()}</TableCell>
                  <TableCell className="capitalize">{tenant.subscriptionPlan.toLowerCase()}</TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {tenant.status === TenantStatus.ACTIVE ? (
                          <DropdownMenuItem
                            onClick={() => suspendMutation.mutate(tenant.id)}
                            className="text-destructive"
                          >
                            Suspend Tenant
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => activateMutation.mutate(tenant.id)}>
                            Activate Tenant
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      {data?.meta && (
        <div className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.meta.total} tenants
        </div>
      )}
    </div>
  );
}
