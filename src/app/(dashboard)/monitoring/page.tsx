'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HealthStatus, RedisMetrics, WhatsAppStatus, ApiMetrics } from '@/types/admin.types';
import { Database, Activity, Server, Zap, MessageSquare, BarChart3 } from 'lucide-react';

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

  const { data: redisMetrics } = useQuery<RedisMetrics>({
    queryKey: ['redis-metrics'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/monitoring/redis');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: whatsappStatus } = useQuery<WhatsAppStatus>({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/monitoring/whatsapp');
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: apiMetrics } = useQuery<ApiMetrics>({
    queryKey: ['api-metrics'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/monitoring/api-metrics');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const getHealthBadge = (status?: 'healthy' | 'degraded' | 'unhealthy') => {
    const variants = {
      healthy: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      degraded: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      unhealthy: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    };

    return (
      <Badge variant="outline" className={`${variants[status || 'unhealthy']} font-semibold transition-colors`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </Badge>
    );
  };

  const getServiceStatusBadge = (status: 'up' | 'down') => {
    return (
      <Badge
        variant="outline"
        className={`font-semibold transition-colors ${
          status === 'up'
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }`}
      >
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            System Monitoring
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time system health and performance metrics
          </p>
        </div>
        {health && getHealthBadge(health.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {health ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'N/A'}
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium">Since last restart</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Services Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {health?.services.filter(s => s.status === 'up').length || 0}/
              {health?.services.length || 0}
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium">Services operational</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              Database Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {dbMetrics?.databaseSize || 'N/A'}
            </div>
            <p className="text-xs text-gray-600 mt-2 font-medium">Total storage used</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Service Health
          </CardTitle>
          <CardDescription>Status of all system services</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {health?.services.map((service) => {
              const Icon = serviceIcons[service.name] || Activity;
              return (
                <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-md">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      {service.responseTime && (
                        <p className="text-xs text-gray-600 font-mono">
                          Response: {service.responseTime}ms
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
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Database Connections
            </CardTitle>
            <CardDescription>Connection pool statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                  {dbMetrics.connections.total}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 font-medium">Active</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {dbMetrics.connections.active}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Idle</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mt-1">
                  {dbMetrics.connections.idle}
                </p>
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

      {/* Redis Metrics */}
      {redisMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Redis Cache Metrics
            </CardTitle>
            <CardDescription>
              Cache performance and memory usage
              {getServiceStatusBadge(redisMetrics.status)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Connected Clients</p>
                <p className="text-2xl font-bold">{redisMetrics.connectedClients ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Used Memory</p>
                <p className="text-2xl font-bold">{redisMetrics.usedMemory || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commands/Sec</p>
                <p className="text-2xl font-bold">{redisMetrics.instantaneousOpsPerSec ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Response Time</p>
                <p className="text-2xl font-bold">{redisMetrics.responseTime ? `${redisMetrics.responseTime}ms` : 'N/A'}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Commands</p>
                  <p className="text-lg font-semibold">{redisMetrics.totalCommandsProcessed?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Keyspace Hits</p>
                  <p className="text-lg font-semibold">{redisMetrics.keyspaceHits?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Keyspace Misses</p>
                  <p className="text-lg font-semibold">{redisMetrics.keyspaceMisses?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Evicted Keys</p>
                  <p className="text-lg font-semibold">{redisMetrics.evictedKeys?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Status */}
      {whatsappStatus && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              WhatsApp Integration Status
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Twilio WhatsApp API connection status
              <span className="ml-2">{getServiceStatusBadge(whatsappStatus.status)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {whatsappStatus.status === 'up' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {whatsappStatus.accountSid && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium">Account SID</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 font-mono">{whatsappStatus.accountSid}</p>
                    </div>
                  )}
                  {whatsappStatus.phoneNumber && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{whatsappStatus.phoneNumber}</p>
                    </div>
                  )}
                  {whatsappStatus.messagesLast24h !== undefined && (
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 font-medium">Messages (24h)</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                        {whatsappStatus.messagesLast24h}
                      </p>
                    </div>
                  )}
                  {whatsappStatus.responseTime && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium">Response Time</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{whatsappStatus.responseTime}ms</p>
                    </div>
                  )}
                  {whatsappStatus.lastMessageSent && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium">Last Message Sent</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {new Date(whatsappStatus.lastMessageSent).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-700 font-bold text-lg">WhatsApp Integration is Down</p>
                {whatsappStatus.error && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{whatsappStatus.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Metrics */}
      {apiMetrics && apiMetrics.totalRequests !== undefined && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                API Performance Metrics
              </CardTitle>
              <CardDescription>Real-time API performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold">{apiMetrics.totalRequests?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold">{apiMetrics.averageResponseTime?.toFixed(0) || '0'}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Error Rate</p>
                  <p className="text-2xl font-bold">{((apiMetrics.errorRate || 0) * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requests/Min</p>
                  <p className="text-2xl font-bold">{apiMetrics.requestsPerMinute?.toFixed(0) || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {apiMetrics.endpoints && apiMetrics.endpoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top API Endpoints</CardTitle>
                <CardDescription>Most frequently used endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Avg Time (ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiMetrics.endpoints.slice(0, 10).map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{endpoint.method}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                        <TableCell className="text-right">{endpoint.count.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{endpoint.averageTime.toFixed(0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
