'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Phone, MapPin, Edit, Trash2, Eye, Search, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { Pharmacy } from '@/types/admin.types';
import { useDebounce } from '@/hooks/useDebounce';
import { KUWAIT_GOVERNORATES, getCitiesByGovernorate } from '@/constants/kuwait-locations';

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    taxNumber: '',
    address: '',
    governorateId: 0,
    cityId: 0,
    brandColor: '#0066CC',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    taxNumber: '',
    address: '',
    governorateId: '',
    cityId: '',
    brandColor: '',
  });

  const [editFormErrors, setEditFormErrors] = useState({
    name: '',
    address: '',
    governorateId: '',
    cityId: '',
    brandColor: '',
  });

  const queryClient = useQueryClient();

  // Fetch pharmacies with search
  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ['pharmacies', debouncedSearch],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(
        `http://localhost:3000/api/v1/pharmacy?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch pharmacies');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Create pharmacy mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/v1/pharmacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create pharmacy');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      setCreateDialogOpen(false);
      toast.success('Pharmacy created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update pharmacy mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/pharmacy/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update pharmacy');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      setEditDialogOpen(false);
      toast.success('Pharmacy updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete pharmacy mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/v1/pharmacy/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete pharmacy');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      setDeleteDialogOpen(false);
      toast.success('Pharmacy deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Validation functions
  const validateForm = () => {
    const errors = {
      name: '',
      phone: '',
      licenseNumber: '',
      taxNumber: '',
      address: '',
      governorateId: '',
      cityId: '',
      brandColor: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Pharmacy name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.name = 'Pharmacy name must contain only letters and spaces';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Pharmacy name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\+965\d{8}$/.test(formData.phone)) {
      errors.phone = 'Phone must be +965 followed by 8 digits';
      isValid = false;
    }

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.licenseNumber)) {
      errors.licenseNumber = 'License number must contain only numbers';
      isValid = false;
    }

    if (formData.taxNumber && !/^\d+$/.test(formData.taxNumber)) {
      errors.taxNumber = 'Tax number must contain only numbers';
      isValid = false;
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    } else if (formData.address.length < 5) {
      errors.address = 'Address must be at least 5 characters';
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

    if (!formData.brandColor.trim()) {
      errors.brandColor = 'Brand color is required';
      isValid = false;
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.brandColor)) {
      errors.brandColor = 'Brand color must be in hex format (e.g., #FF5733)';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateEditForm = () => {
    const errors = {
      name: '',
      address: '',
      governorateId: '',
      cityId: '',
      brandColor: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Pharmacy name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.name = 'Pharmacy name must contain only letters and spaces';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Pharmacy name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    } else if (formData.address.length < 5) {
      errors.address = 'Address must be at least 5 characters';
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

    if (!formData.brandColor.trim()) {
      errors.brandColor = 'Brand color is required';
      isValid = false;
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.brandColor)) {
      errors.brandColor = 'Brand color must be in hex format (e.g., #FF5733)';
      isValid = false;
    }

    setEditFormErrors(errors);
    return isValid;
  };

  // Form handlers
  const handleCreatePharmacy = () => {
    if (!validateForm()) {
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditPharmacy = () => {
    if (!selectedPharmacy) return;
    if (!validateEditForm()) {
      return;
    }
    updateMutation.mutate({
      id: selectedPharmacy.id,
      data: {
        name: formData.name,
        address: formData.address,
        governorateId: formData.governorateId,
        cityId: formData.cityId,
        brandColor: formData.brandColor,
      },
    });
  };

  const openEditDialog = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      phone: pharmacy.phone,
      licenseNumber: pharmacy.licenseNumber,
      taxNumber: pharmacy.taxNumber || '',
      address: pharmacy.address,
      governorateId: pharmacy.governorateId,
      cityId: pharmacy.cityId,
      brandColor: pharmacy.brandColor,
    });
    setEditFormErrors({
      name: '',
      address: '',
      governorateId: '',
      cityId: '',
      brandColor: '',
    });
    setEditDialogOpen(true);
  };

  const openViewDetails = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setViewDetailsOpen(true);
  };

  const openDeleteDialog = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setDeleteDialogOpen(true);
  };

  // Reset form when create dialog opens
  useEffect(() => {
    if (createDialogOpen) {
      setFormData({
        name: '',
        phone: '',
        licenseNumber: '',
        taxNumber: '',
        address: '',
        governorateId: 0,
        cityId: 0,
        brandColor: '#0066CC',
      });
      setFormErrors({
        name: '',
        phone: '',
        licenseNumber: '',
        taxNumber: '',
        address: '',
        governorateId: '',
        cityId: '',
        brandColor: '',
      });
    }
  }, [createDialogOpen]);

  const getGovernorateById = (id: number) => {
    return KUWAIT_GOVERNORATES.find(gov => gov.id === id);
  };

  const getCityById = (govId: number, cityId: number) => {
    const cities = getCitiesByGovernorate(govId);
    return cities.find(city => city.id === cityId);
  };

  const filteredCities = formData.governorateId
    ? getCitiesByGovernorate(formData.governorateId)
    : [];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Pharmacies Management
            </h1>
            <p className="text-gray-600 mt-1">Manage pharmacy locations and settings</p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Pharmacy
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pharmacies by name, code, or license number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Pharmacies</CardTitle>
            <CardDescription>
              {pharmacies?.length || 0} total pharmacy locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading pharmacies...
                    </TableCell>
                  </TableRow>
                ) : pharmacies?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No pharmacies found
                    </TableCell>
                  </TableRow>
                ) : (
                  pharmacies?.map((pharmacy: Pharmacy) => (
                    <TableRow key={pharmacy.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pharmacy.brandColor }}
                        />
                        {pharmacy.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{pharmacy.code}</code>
                      </TableCell>
                      <TableCell>{pharmacy.licenseNumber}</TableCell>
                      <TableCell className="font-mono text-sm">{pharmacy.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {getGovernorateById(pharmacy.governorateId)?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pharmacy.isActive ? 'default' : 'secondary'}>
                          {pharmacy.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDetails(pharmacy)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(pharmacy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(pharmacy)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Create New Pharmacy
            </DialogTitle>
            <DialogDescription>
              Add a new pharmacy location to the system
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Pharmacy Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                placeholder="Al Hamad Pharmacy"
                className={`mt-1 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
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
              {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
            </div>

            {/* License & Tax Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="licenseNumber" className="text-sm font-medium">
                  License Number <span className="text-red-500">*</span>
                </label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, licenseNumber: e.target.value });
                    if (formErrors.licenseNumber) setFormErrors({ ...formErrors, licenseNumber: '' });
                  }}
                  placeholder="123456789"
                  className={`mt-1 ${formErrors.licenseNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.licenseNumber && <p className="text-xs text-red-600 mt-1">{formErrors.licenseNumber}</p>}
              </div>
              <div>
                <label htmlFor="taxNumber" className="text-sm font-medium">
                  Tax Number
                </label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, taxNumber: e.target.value });
                    if (formErrors.taxNumber) setFormErrors({ ...formErrors, taxNumber: '' });
                  }}
                  placeholder="987654321"
                  className={`mt-1 ${formErrors.taxNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.taxNumber && <p className="text-xs text-red-600 mt-1">{formErrors.taxNumber}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                }}
                placeholder="123 Main Street, Building 45"
                className={`mt-1 ${formErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="governorate" className="text-sm font-medium">
                  Governorate <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.governorateId?.toString() || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, governorateId: parseInt(value), cityId: 0 });
                    if (formErrors.governorateId) setFormErrors({ ...formErrors, governorateId: '' });
                  }}
                >
                  <SelectTrigger className={`mt-1 ${formErrors.governorateId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                    <SelectValue placeholder="Select governorate" />
                  </SelectTrigger>
                  <SelectContent>
                    {KUWAIT_GOVERNORATES.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id.toString()}>
                        {gov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.governorateId && <p className="text-xs text-red-600 mt-1">{formErrors.governorateId}</p>}
              </div>
              <div>
                <label htmlFor="city" className="text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
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
                    {filteredCities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.cityId && <p className="text-xs text-red-600 mt-1">{formErrors.cityId}</p>}
              </div>
            </div>

            {/* Brand Color */}
            <div>
              <label htmlFor="brandColor" className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Brand Color <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="brandColor"
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => {
                    setFormData({ ...formData, brandColor: e.target.value });
                    if (formErrors.brandColor) setFormErrors({ ...formErrors, brandColor: '' });
                  }}
                  className="w-16 h-10 cursor-pointer"
                />
                <Input
                  value={formData.brandColor}
                  onChange={(e) => {
                    setFormData({ ...formData, brandColor: e.target.value });
                    if (formErrors.brandColor) setFormErrors({ ...formErrors, brandColor: '' });
                  }}
                  placeholder="#0066CC"
                  className={`flex-1 ${formErrors.brandColor ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {formErrors.brandColor ? (
                <p className="text-xs text-red-600 mt-1">{formErrors.brandColor}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Hex format: #RRGGBB</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePharmacy}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Pharmacy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Pharmacy
            </DialogTitle>
            <DialogDescription>
              Update pharmacy information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Name */}
            <div>
              <label htmlFor="edit-name" className="text-sm font-medium">
                Pharmacy Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (editFormErrors.name) setEditFormErrors({ ...editFormErrors, name: '' });
                }}
                placeholder="Al Hamad Pharmacy"
                className={`mt-1 ${editFormErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {editFormErrors.name && <p className="text-xs text-red-600 mt-1">{editFormErrors.name}</p>}
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <Input value={formData.phone} disabled className="mt-1 bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">License Number</label>
                <Input value={formData.licenseNumber} disabled className="mt-1 bg-gray-50" />
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="edit-address" className="text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (editFormErrors.address) setEditFormErrors({ ...editFormErrors, address: '' });
                }}
                placeholder="123 Main Street, Building 45"
                className={`mt-1 ${editFormErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {editFormErrors.address && <p className="text-xs text-red-600 mt-1">{editFormErrors.address}</p>}
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Governorate <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.governorateId?.toString() || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, governorateId: parseInt(value), cityId: 0 });
                    if (editFormErrors.governorateId) setEditFormErrors({ ...editFormErrors, governorateId: '' });
                  }}
                >
                  <SelectTrigger className={`mt-1 ${editFormErrors.governorateId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                    <SelectValue placeholder="Select governorate" />
                  </SelectTrigger>
                  <SelectContent>
                    {KUWAIT_GOVERNORATES.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id.toString()}>
                        {gov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormErrors.governorateId && <p className="text-xs text-red-600 mt-1">{editFormErrors.governorateId}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.cityId?.toString() || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, cityId: parseInt(value) });
                    if (editFormErrors.cityId) setEditFormErrors({ ...editFormErrors, cityId: '' });
                  }}
                  disabled={!formData.governorateId}
                >
                  <SelectTrigger className={`mt-1 ${editFormErrors.cityId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormErrors.cityId && <p className="text-xs text-red-600 mt-1">{editFormErrors.cityId}</p>}
              </div>
            </div>

            {/* Brand Color */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Brand Color <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => {
                    setFormData({ ...formData, brandColor: e.target.value });
                    if (editFormErrors.brandColor) setEditFormErrors({ ...editFormErrors, brandColor: '' });
                  }}
                  className="w-16 h-10 cursor-pointer"
                />
                <Input
                  value={formData.brandColor}
                  onChange={(e) => {
                    setFormData({ ...formData, brandColor: e.target.value });
                    if (editFormErrors.brandColor) setEditFormErrors({ ...editFormErrors, brandColor: '' });
                  }}
                  placeholder="#0066CC"
                  className={`flex-1 ${editFormErrors.brandColor ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {editFormErrors.brandColor && <p className="text-xs text-red-600 mt-1">{editFormErrors.brandColor}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditPharmacy}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Pharmacy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -mt-6 -mx-6 px-6 py-4 mb-6 border-b">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Pharmacy Details
            </DialogTitle>
          </DialogHeader>

          {selectedPharmacy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedPharmacy.brandColor }}
                    />
                    {selectedPharmacy.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Code</label>
                  <p className="mt-1">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedPharmacy.code}</code>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">License Number</label>
                  <p className="mt-1">{selectedPharmacy.licenseNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tax Number</label>
                  <p className="mt-1">{selectedPharmacy.taxNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedPharmacy.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand Color</label>
                  <p className="mt-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedPharmacy.brandColor }}
                    />
                    {selectedPharmacy.brandColor}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1">{selectedPharmacy.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Governorate</label>
                  <p className="mt-1">
                    {getGovernorateById(selectedPharmacy.governorateId)?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="mt-1">
                    {getCityById(selectedPharmacy.governorateId, selectedPharmacy.cityId)?.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <Badge variant={selectedPharmacy.isActive ? 'default' : 'secondary'}>
                      {selectedPharmacy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-sm">
                    {new Date(selectedPharmacy.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Pharmacy"
        description={`Are you sure you want to delete "${selectedPharmacy?.name}"? This action cannot be undone and will affect all associated branches.`}
        onConfirm={() => selectedPharmacy && deleteMutation.mutate(selectedPharmacy.id)}
        isLoading={deleteMutation.isPending}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
