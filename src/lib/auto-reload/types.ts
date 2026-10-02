// Advanced Auto-Reload System for App Infrastructure
// Handles DB Loading & UI Load Fail problems

export enum ProblemType {
  DATABASE_LOADING = 'database_loading',
  BROWSER_UI_FAIL = 'browser_ui_fail',
  APP_INFRASTRUCTURE = 'app_infrastructure',
  NETWORK_CONNECTIVITY = 'network_connectivity',
  SYSTEM_OVERLOAD = 'system_overload'
}

export enum RecoveryStatus {
  DETECTING = 'detecting',
  RECOVERING = 'recovering',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying'
}

export interface AutoReloadConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  maxBackoffTime: number;
  healthCheckInterval: number;
  enableNotifications: boolean;
  enableLogging: boolean;
}

export interface RecoveryMetrics {
  totalAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  lastRecoveryTime: Date | null;
  problemTypes: Record<ProblemType, number>;
}

export interface HealthStatus {
  database: {
    connected: boolean;
    responseTime: number;
    lastCheck: Date;
    errors: number;
  };
  ui: {
    rendered: boolean;
    renderTime: number;
    lastCheck: Date;
    errors: number;
  };
  network: {
    connected: boolean;
    speed: number;
    lastCheck: Date;
    errors: number;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    lastCheck: Date;
    errors: number;
  };
}

export interface AutoReloadState {
  status: RecoveryStatus;
  currentProblem: ProblemType | null;
  retryCount: number;
  lastError: Error | null;
  metrics: RecoveryMetrics;
  config: AutoReloadConfig;
  healthStatus: HealthStatus;
  isAutoReloadEnabled: boolean;
}
