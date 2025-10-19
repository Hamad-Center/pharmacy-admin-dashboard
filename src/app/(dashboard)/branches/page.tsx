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
import { Branch } from '@/types/admin.types';
import { Plus, Search, Edit, Trash, MapPin, Phone, Map, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

export default function BranchesPage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchForAction, setBranchForAction] = useState<Branch | null>(null);
  const queryClient = useQueryClient();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    governorateId: 0,
    cityId: 0,
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    address: '',
    governorateId: '',
    cityId: '',
  });

  // Edit form errors state
  const [editFormErrors, setEditFormErrors] = useState({
    name: '',
    address: '',
    governorateId: '',
    cityId: '',
  });

  // Reset pharmacy selection when tenant changes
  useEffect(() => {
    setSelectedPharmacyId('');
  }, [selectedTenantId]);

  // Reset form when create dialog opens
  useEffect(() => {
    if (createDialogOpen) {
      setFormData({
        name: '',
        phone: '',
        address: '',
        governorateId: 0,
        cityId: 0,
      });
      setFormErrors({
        name: '',
        phone: '',
        address: '',
        governorateId: '',
        cityId: '',
      });
    }
  }, [createDialogOpen]);

  // Reset city when governorate changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, cityId: 0 }));
  }, [formData.governorateId]);

  // Validation function for create branch form
  const validateCreateBranchForm = () => {
    const errors = {
      name: '',
      phone: '',
      address: '',
      governorateId: '',
      cityId: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Branch name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Branch name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\+965\d{8}$/.test(formData.phone)) {
      errors.phone = 'Phone must be in format +965 followed by 8 digits';
      isValid = false;
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    } else if (formData.address.length < 10) {
      errors.address = 'Address must be at least 10 characters';
      isValid = false;
    }

    if (!formData.governorateId || formData.governorateId === 0) {
      errors.governorateId = 'Please select a governorate';
      isValid = false;
    }

    if (!formData.cityId || formData.cityId === 0) {
      errors.cityId = 'Please select a city';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Validation function for edit branch form
  const validateEditBranchForm = () => {
    const errors = {
      name: '',
      address: '',
      governorateId: '',
      cityId: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Branch name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Branch name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    } else if (formData.address.length < 10) {
      errors.address = 'Address must be at least 10 characters';
      isValid = false;
    }

    if (!formData.governorateId || formData.governorateId === 0) {
      errors.governorateId = 'Please select a governorate';
      isValid = false;
    }

    if (!formData.cityId || formData.cityId === 0) {
      errors.cityId = 'Please select a city';
      isValid = false;
    }

    setEditFormErrors(errors);
    return isValid;
  };

  // Fetch tenants for selection
  const { data: tenantsData } = useQuery({
    queryKey: ['tenants-simple'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/tenants', { params: { page: 1, limit: 100 } });
      return response.data;
    },
  });

  // Fetch pharmacies for selected tenant
  const { data: pharmaciesData } = useQuery({
    queryKey: ['pharmacies-for-tenant', selectedTenantId],
    queryFn: async () => {
      if (!selectedTenantId) return { success: true, data: [] };
      const response = await api.get('/api/v1/admin/pharmacies', {
        params: { tenantId: selectedTenantId }
      });
      return response.data;
    },
    enabled: !!selectedTenantId,
  });

  // Fetch governorates from API
  const { data: governoratesData } = useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const response = await api.get('/api/v1/lookups/governorates');
      return response.data;
    },
  });

  // Fetch cities for selected governorate
  const { data: citiesData } = useQuery({
    queryKey: ['cities', formData.governorateId],
    queryFn: async () => {
      if (!formData.governorateId) return { success: true, data: [] };
      const response = await api.get('/api/v1/lookups/cities', {
        params: { governorateId: formData.governorateId }
      });
      return response.data;
    },
    enabled: !!formData.governorateId,
  });

  // Fetch branches when pharmacy is selected
  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['admin-branches', selectedPharmacyId, debouncedSearch],
    queryFn: async () => {
      if (!selectedPharmacyId) return { success: true, data: [] };

      const response = await api.get('/api/v1/admin/branches', {
        params: {
          pharmacyId: selectedPharmacyId,
          search: debouncedSearch || undefined
        }
      });
      return response.data;
    },
    enabled: !!selectedPharmacyId,
  });

  // Create branch mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!selectedPharmacyId) throw new Error('No pharmacy selected');
      if (!selectedTenantId) throw new Error('No tenant selected');

      const response = await api.post('/api/v1/admin/branches', {
        ...data,
        tenantId: selectedTenantId,
        pharmacyId: selectedPharmacyId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      setCreateDialogOpen(false);
      setFormData({
        name: '',
        phone: '',
        address: '',
        governorateId: 0,
        cityId: 0,
      });
      toast.success('Branch created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create branch');
    },
  });

  // Update branch mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const response = await api.put(`/api/v1/admin/branches/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      setEditDialogOpen(false);
      setSelectedBranch(null);
      toast.success('Branch updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    },
  });

  // Delete branch mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/v1/admin/branches/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      toast.success('Branch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete branch');
    },
  });

  const handleCreateBranch = () => {
    if (!validateCreateBranchForm()) {
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditBranch = () => {
    if (!selectedBranch) return;
    if (!validateEditBranchForm()) {
      return;
    }
    updateMutation.mutate({ id: selectedBranch.id, data: formData });
  };

  const handleDeleteBranch = (branch: Branch) => {
    setBranchForAction(branch);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (branchForAction) {
      deleteMutation.mutate(branchForAction.id);
      setBranchForAction(null);
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      phone: branch.phone,
      address: branch.address,
      governorateId: branch.governorateId,
      cityId: branch.cityId,
    });
    setEditFormErrors({
      name: '',
      address: '',
      governorateId: '',
      cityId: '',
    });
    setEditDialogOpen(true);
  };

  const branches = branchesData?.data || [];
  const hasSelection = selectedPharmacyId && selectedTenantId;

  // Get selected tenant and pharmacy info for context display
  const selectedTenant = tenantsData?.data?.find((t: any) => t.id === selectedTenantId);
  const selectedPharmacy = pharmaciesData?.data?.find((p: any) => p.id === selectedPharmacyId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Branch Management
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Manage pharmacy branches and locations
          </p>
        </div>

        {hasSelection && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 shadow-lg shadow-teal-500/30">
                <Plus className="h-4 w-4 mr-2" />
                Create Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
                <DialogTitle className="text-xl">Create New Branch</DialogTitle>
                <DialogDescription>
                  Add a new branch location for the pharmacy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Branch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="Main Branch"
                    className={`mt-1 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                    }}
                    placeholder="+96512345678"
                    className={`mt-1 ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.phone ? (
                    <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Format: +965 followed by 8 digits</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="governorate" className="text-sm font-medium">Governorate *</Label>
                  <Select
                    value={formData.governorateId?.toString() || ''}
                    onValueChange={(value) => {
                      setFormData({ ...formData, governorateId: parseInt(value) });
                      if (formErrors.governorateId) setFormErrors({ ...formErrors, governorateId: '' });
                    }}
                  >
                    <SelectTrigger className={`mt-1 ${formErrors.governorateId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {governoratesData?.map((gov: any) => (
                        <SelectItem key={gov.id} value={gov.id.toString()}>
                          {gov.stateEN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.governorateId && <p className="text-xs text-red-600 mt-1">{formErrors.governorateId}</p>}
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                  <Select
                    value={formData.cityId?.toString() || ''}
                    onValueChange={(value) => {
                      setFormData({ ...formData, cityId: parseInt(value) });
                      if (formErrors.cityId) setFormErrors({ ...formErrors, cityId: '' });
                    }}
                    disabled={!formData.governorateId}
                  >
                    <SelectTrigger className={`mt-1 ${formErrors.cityId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesData?.map((city: any) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.cityEN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.cityId && <p className="text-xs text-red-600 mt-1">{formErrors.cityId}</p>}
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">Full Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                    }}
                    placeholder="123 Main Street, Building 456"
                    className={`mt-1 ${formErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
                </div>
              </div>
              <DialogFooter className="gap-2 mt-6">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBranch}
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Branch'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Context Display Card */}
      {hasSelection && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" />
              <span className="font-medium text-gray-700">Tenant:</span>
              <span className="text-gray-900 font-semibold">{selectedTenant?.name}</span>
              <Badge variant="outline" className="ml-1">{selectedTenant?.code}</Badge>
            </div>
            <div className="h-4 w-px bg-teal-300" />
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              <span className="font-medium text-gray-700">Pharmacy:</span>
              <span className="text-gray-900 font-semibold">{selectedPharmacy?.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tenant and Pharmacy Selection */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tenant" className="text-sm font-medium mb-2 block">Select Tenant *</Label>
          <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
            <SelectTrigger className="bg-white border-gray-200 shadow-sm">
              <SelectValue placeholder="Choose a tenant" />
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
          <Label htmlFor="pharmacy" className="text-sm font-medium mb-2 block">Select Pharmacy *</Label>
          <Select
            value={selectedPharmacyId}
            onValueChange={setSelectedPharmacyId}
            disabled={!selectedTenantId}
          >
            <SelectTrigger className="bg-white border-gray-200 shadow-sm">
              <SelectValue placeholder={selectedTenantId ? "Choose a pharmacy" : "Select tenant first"} />
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

        {hasSelection && (
          <div className="relative">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search Branches</Label>
            <Search className="absolute left-3 bottom-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-teal-300 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Branches Table */}
      {!hasSelection ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Selection</h3>
          <p className="text-gray-500">Please select a tenant and pharmacy to view and manage branches</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading branches...</p>
          </div>
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
          <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Branches Found</h3>
          <p className="text-gray-500 mb-4">
            {search ? 'No branches match your search criteria' : 'This pharmacy doesn\'t have any branches yet'}
          </p>
          {!search && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Branch
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <TableHead className="font-semibold text-gray-900">Branch Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Phone</TableHead>
                <TableHead className="font-semibold text-gray-900">Governorate</TableHead>
                <TableHead className="font-semibold text-gray-900">City</TableHead>
                <TableHead className="font-semibold text-gray-900">Address</TableHead>
                <TableHead className="font-semibold text-gray-900">Tenant</TableHead>
                <TableHead className="font-semibold text-gray-900">Pharmacy</TableHead>
                <TableHead className="font-semibold text-gray-900">Created</TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch: any) => (
                <TableRow key={branch.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <TableCell className="font-semibold text-gray-900">{branch.name}</TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {branch.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {branch.governorate?.stateEN || 'N/A'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {branch.city?.cityEN || 'N/A'}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm max-w-xs truncate" title={branch.address}>
                    {branch.address}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{branch.pharmacy?.tenant?.name || 'N/A'}</span>
                      <Badge variant="outline" className="w-fit text-xs">{branch.pharmacy?.tenant?.code || 'N/A'}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {branch.pharmacy?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(branch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBranch(branch)}>
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader className="bg-gradient-to-r from-purple-50 to-pink-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl">Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium">Branch Name *</Label>
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
              <Label htmlFor="edit-phone" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="edit-governorate" className="text-sm font-medium">Governorate *</Label>
              <Select
                value={formData.governorateId?.toString() || ''}
                onValueChange={(value) => {
                  setFormData({ ...formData, governorateId: parseInt(value) });
                  if (editFormErrors.governorateId) setEditFormErrors({ ...editFormErrors, governorateId: '' });
                }}
              >
                <SelectTrigger className={`mt-1 ${editFormErrors.governorateId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {governoratesData?.map((gov: any) => (
                    <SelectItem key={gov.id} value={gov.id.toString()}>
                      {gov.stateEN}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editFormErrors.governorateId && <p className="text-xs text-red-600 mt-1">{editFormErrors.governorateId}</p>}
            </div>
            <div>
              <Label htmlFor="edit-city" className="text-sm font-medium">City *</Label>
              <Select
                value={formData.cityId?.toString() || ''}
                onValueChange={(value) => {
                  setFormData({ ...formData, cityId: parseInt(value) });
                  if (editFormErrors.cityId) setEditFormErrors({ ...editFormErrors, cityId: '' });
                }}
                disabled={!formData.governorateId}
              >
                <SelectTrigger className={`mt-1 ${editFormErrors.cityId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {citiesData?.map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.cityEN}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editFormErrors.cityId && <p className="text-xs text-red-600 mt-1">{editFormErrors.cityId}</p>}
            </div>
            <div>
              <Label htmlFor="edit-address" className="text-sm font-medium">Full Address *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (editFormErrors.address) setEditFormErrors({ ...editFormErrors, address: '' });
                }}
                className={`mt-1 ${editFormErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {editFormErrors.address && <p className="text-xs text-red-600 mt-1">{editFormErrors.address}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditBranch}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Branch"
        description={`Are you sure you want to delete "${branchForAction?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Branch"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
