'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Activity, Database, TrendingUp, Shield, Clock } from 'lucide-react';
import { PaginatedResponse, Tenant, User, HealthStatus } from '@/types/admin.types';

export default function DashboardPage() {
  // Fetch tenants count
  const { data: tenantsData } = useQuery<PaginatedResponse<Tenant>>({
    queryKey: ['tenants-count'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/tenants', {
        params: { page: 1, limit: 1 }
      });
      return response.data;
    },
  });

  // Fetch users count
  const { data: usersData } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users-count'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/users', {
        params: { page: 1, limit: 1 }
      });
      return response.data;
    },
  });

  // Fetch system health
  const { data: healthData } = useQuery<HealthStatus>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/monitoring/health');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const totalTenants = tenantsData?.meta?.total || 0;
  const totalUsers = usersData?.meta?.total || 0;
  const activeUsers = usersData?.data?.filter(u => u.isActive).length || 0;

  const statCards = [
    {
      title: 'Total Tenants',
      value: totalTenants,
      icon: Building2,
      description: 'Active pharmacy tenants',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'All users across tenants',
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-500',
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: TrendingUp,
      description: 'Currently active users',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-500',
    },
    {
      title: 'System Health',
      value: healthData?.status || 'checking...',
      icon: Shield,
      description: healthData?.status === 'healthy' ? 'All systems operational' : 'Service issues detected',
      gradient: healthData?.status === 'healthy' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500',
      bgGradient: healthData?.status === 'healthy' ? 'from-green-50 to-emerald-50' : 'from-red-50 to-rose-50',
      iconBg: healthData?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/20 blur-2xl"></div>

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg} shadow-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent capitalize`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Services Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">System Services</CardTitle>
                <CardDescription>Real-time service health monitoring</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {healthData?.services?.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`relative h-3 w-3 rounded-full ${service.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {service.status === 'up' && (
                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium capitalize text-gray-900">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.responseTime && (
                      <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border">
                        {service.responseTime}ms
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      service.status === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {service.status === 'up' ? 'Operational' : 'Down'}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-gray-500 text-center py-4">Loading service status...</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Uptime Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">System Information</CardTitle>
                <CardDescription>Server runtime and metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                <p className="text-sm text-gray-600 mb-1 font-medium">System Uptime</p>
                <p className="text-3xl font-bold text-blue-600">
                  {healthData?.uptime
                    ? `${Math.floor(healthData.uptime / 3600)}h ${Math.floor((healthData.uptime % 3600) / 60)}m`
                    : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Last Health Check</p>
                <p className="text-sm font-semibold text-gray-900">
                  {healthData?.timestamp
                    ? new Date(healthData.timestamp).toLocaleString()
                    : 'Loading...'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <p className="text-sm text-gray-600 mb-1 font-medium">Overall Status</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    healthData?.status === 'healthy' ? 'bg-green-500 animate-pulse' :
                    healthData?.status === 'degraded' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <p className={`text-lg font-bold capitalize ${
                    healthData?.status === 'healthy' ? 'text-green-600' :
                    healthData?.status === 'degraded' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {healthData?.status || 'Checking...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
