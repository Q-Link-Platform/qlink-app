import { AutoReloadConfig, ProblemType, RecoveryStatus } from './types';

// App-specific auto-reload configuration
export const DEFAULT_AUTO_RELOAD_CONFIG: AutoReloadConfig = {
  maxRetries: 5,
  retryDelay: 1000, // 1 second
  exponentialBackoff: true,
  maxBackoffTime: 30000, // 30 seconds max
  healthCheckInterval: 5000, // 5 seconds
  enableNotifications: true,
  enableLogging: true
};

// Problem-specific recovery strategies
export const RECOVERY_STRATEGIES = {
  [ProblemType.DATABASE_LOADING]: {
    maxRetries: 3,
    retryDelay: 2000,
    strategy: 'reconnect_and_retry',
    fallback: 'use_cached_data'
  },
  [ProblemType.BROWSER_UI_FAIL]: {
    maxRetries: 5,
    retryDelay: 500,
    strategy: 'force_rerender',
    fallback: 'minimal_ui'
  },
  [ProblemType.APP_INFRASTRUCTURE]: {
    maxRetries: 2,
    retryDelay: 5000,
    strategy: 'restart_services',
    fallback: 'safe_mode'
  },
  [ProblemType.NETWORK_CONNECTIVITY]: {
    maxRetries: 10,
    retryDelay: 1000,
    strategy: 'reconnect_network',
    fallback: 'offline_mode'
  },
  [ProblemType.SYSTEM_OVERLOAD]: {
    maxRetries: 3,
    retryDelay: 3000,
    strategy: 'reduce_load',
    fallback: 'essential_only'
  }
};

// Error classification patterns
export const ERROR_PATTERNS = {
  [ProblemType.DATABASE_LOADING]: [
    /connection/i,
    /timeout/i,
    /database/i,
    /prisma/i,
    /query/i,
    /pool/i
  ],
  [ProblemType.BROWSER_UI_FAIL]: [
    /render/i,
    /component/i,
    /hydration/i,
    /ui/i,
    /dom/i,
    /element/i
  ],
  [ProblemType.APP_INFRASTRUCTURE]: [
    /server/i,
    /infrastructure/i,
    /system/i,
    /service/i,
    /middleware/i
  ],
  [ProblemType.NETWORK_CONNECTIVITY]: [
    /network/i,
    /fetch/i,
    /connection/i,
    /offline/i,
    /internet/i
  ],
  [ProblemType.SYSTEM_OVERLOAD]: [
    /memory/i,
    /cpu/i,
    /overload/i,
    /performance/i,
    /slow/i
  ]
};

// Health check thresholds
export const HEALTH_THRESHOLDS = {
  database: {
    maxResponseTime: 2000, // 2 seconds
    maxErrors: 3
  },
  ui: {
    maxRenderTime: 1000, // 1 second
    maxErrors: 5
  },
  network: {
    minSpeed: 100, // KB/s
    maxErrors: 2
  },
  system: {
    maxMemoryUsage: 80, // 80%
    maxCpuUsage: 90 // 90%
  }
};
