'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HealthStatus } from '@/types/admin.types';
import { Database, Activity, Server, Zap } from 'lucide-react';

export default function MonitoringPage() {
  const { data: health } = useQuery<HealthStatus>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/monitoring/health');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: dbMetrics } = useQuery({
    queryKey: ['database-metrics'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/monitoring/database');
      return response.data;
    },
    refetchInterval: 60000,
  });

  const getHealthBadge = (status?: 'healthy' | 'degraded' | 'unhealthy') => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      unhealthy: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status || 'unhealthy']}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </Badge>
    );
  };

  const getServiceStatusBadge = (status: 'up' | 'down') => {
    return (
      <Badge className={status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const serviceIcons: Record<string, React.ElementType> = {
    PostgreSQL: Database,
    Redis: Zap,
    'Bull Queues': Server,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-500 mt-1">Real-time system health and performance</p>
        </div>
        {health && getHealthBadge(health.status)}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Since last restart</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.services.filter(s => s.status === 'up').length || 0}/
              {health?.services.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dbMetrics?.databaseSize || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total storage used</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health?.services.map((service) => {
              const Icon = serviceIcons[service.name] || Activity;
              return (
                <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.responseTime && (
                        <p className="text-sm text-gray-500">
                          Response time: {service.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                  {getServiceStatusBadge(service.status)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {dbMetrics?.connections && (
        <Card>
          <CardHeader>
            <CardTitle>Database Connections</CardTitle>
            <CardDescription>Connection pool statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{dbMetrics.connections.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{dbMetrics.connections.active}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Idle</p>
                <p className="text-2xl font-bold">{dbMetrics.connections.idle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {dbMetrics?.topTables && dbMetrics.topTables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Tables by Size</CardTitle>
            <CardDescription>Largest database tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dbMetrics.topTables.slice(0, 10).map((table: { tablename: string; size: string }) => (
                <div key={table.tablename} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{table.tablename}</span>
                  <span className="text-sm text-gray-500">{table.size}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
