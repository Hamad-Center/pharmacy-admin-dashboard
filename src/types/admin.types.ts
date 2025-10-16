export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum UserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  PHARMACIST = 'PHARMACIST',
  ASSISTANT = 'ASSISTANT',
  CASHIER = 'CASHIER',
  CUSTOMER = 'CUSTOMER',
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  trialEndsAt?: Date;
  billingEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  suspendedAt?: Date;
  suspendedReason?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  isActive: boolean;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  tenant?: {
    id: string;
    name: string;
    code: string;
    status: TenantStatus;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: Date;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  details?: Record<string, unknown>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    email: string;
    name: string;
    roleId: string | null;
  };
}

export interface RedisMetrics {
  status: 'up' | 'down';
  connectedClients: number;
  usedMemory: string;
  usedMemoryPeak: string;
  totalCommandsProcessed: number;
  instantaneousOpsPerSec: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  evictedKeys: number;
  responseTime: number;
}

export interface WhatsAppStatus {
  status: 'up' | 'down';
  accountSid?: string;
  phoneNumber?: string;
  messagesLast24h?: number;
  responseTime?: number;
  lastMessageSent?: Date;
  error?: string;
}

export interface ApiMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  endpoints: {
    path: string;
    method: string;
    count: number;
    averageTime: number;
  }[];
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture?: string;
  userType: UserType;
  language?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
}

export interface Branch {
  id: string;
  name: string;
  phone: string;
  address: string;
  governorateId: number;
  governorateName?: string;
  cityId: number;
  cityName?: string;
  pharmacyId: string;
  pharmacy?: {
    id: string;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
    code: string;
  };
  tenantId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Pharmacy {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  phone: string;
  licenseNumber: string;
  taxNumber?: string;
  address: string;
  governorateId: number;
  governorateName?: string;
  cityId: number;
  cityName?: string;
  logoUrl?: string;
  brandColor: string;
  adminUserId?: string;
  operatingHours?: Record<string, {
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  settings?: {
    deliveryFee?: number;
    defaultMarkup?: number;
    enableDelivery?: boolean;
    enableWhatsApp?: boolean;
    allowOnlineOrders?: boolean;
    maxDeliveryRadius?: number;
    autoOrderThreshold?: number;
    requirePrescription?: boolean;
    freeDeliveryThreshold?: number;
  };
  paymentMethods?: {
    card?: boolean;
    cash?: boolean;
    wallet?: boolean;
    insurance?: boolean;
    installments?: boolean;
  };
  isActive: boolean;
  tenant?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
