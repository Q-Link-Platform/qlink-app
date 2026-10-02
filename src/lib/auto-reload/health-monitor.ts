import { HealthStatus } from './types';
import { HEALTH_THRESHOLDS } from './config';

// Advanced health monitoring system
export class HealthMonitor {
  private healthStatus: HealthStatus;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private callbacks: ((status: HealthStatus) => void)[] = [];

  constructor() {
    this.healthStatus = {
      database: {
        connected: false,
        responseTime: 0,
        lastCheck: new Date(),
        errors: 0
      },
      ui: {
        rendered: false,
        renderTime: 0,
        lastCheck: new Date(),
        errors: 0
      },
      network: {
        connected: false,
        speed: 0,
        lastCheck: new Date(),
        errors: 0
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        lastCheck: new Date(),
        errors: 0
      }
    };
  }

  // Start continuous health monitoring
  startMonitoring(interval: number = 5000): void {
    this.stopMonitoring();
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, interval);
  }

  // Stop health monitoring
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Subscribe to health status updates
  onHealthUpdate(callback: (status: HealthStatus) => void): void {
    this.callbacks.push(callback);
  }

  // Unsubscribe from health updates
  offHealthUpdate(callback: (status: HealthStatus) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // Get current health status
  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  // Perform comprehensive health check
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();

    try {
      // Check database health
      await this.checkDatabaseHealth();
      
      // Check UI health
      await this.checkUIHealth();
      
      // Check network health
      await this.checkNetworkHealth();
      
      // Check system health
      await this.checkSystemHealth();

      // Notify callbacks
      this.notifyCallbacks();
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  // Database health check
  private async checkDatabaseHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate database health check
      const response = await fetch('/api/health/database', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const responseTime = Date.now() - startTime;
      
      this.healthStatus.database = {
        connected: response.ok,
        responseTime,
        lastCheck: new Date(),
        errors: response.ok ? 0 : this.healthStatus.database.errors + 1
      };
    } catch (error) {
      this.healthStatus.database = {
        connected: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errors: this.healthStatus.database.errors + 1
      };
    }
  }

  // UI health check
  private async checkUIHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if critical UI elements are rendered
      const criticalElements = document.querySelectorAll('[data-critical="true"]');
      const rendered = criticalElements.length > 0;
      const renderTime = Date.now() - startTime;
      
      this.healthStatus.ui = {
        rendered,
        renderTime,
        lastCheck: new Date(),
        errors: rendered ? 0 : this.healthStatus.ui.errors + 1
      };
    } catch (error) {
      this.healthStatus.ui = {
        rendered: false,
        renderTime: Date.now() - startTime,
        lastCheck: new Date(),
        errors: this.healthStatus.ui.errors + 1
      };
    }
  }

  // Network health check
  private async checkNetworkHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check network connectivity
      const response = await fetch('/api/health/network', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const responseTime = Date.now() - startTime;
      const speed = 1000 / responseTime; // Simple speed calculation
      
      this.healthStatus.network = {
        connected: response.ok,
        speed,
        lastCheck: new Date(),
        errors: response.ok ? 0 : this.healthStatus.network.errors + 1
      };
    } catch (error) {
      this.healthStatus.network = {
        connected: false,
        speed: 0,
        lastCheck: new Date(),
        errors: this.healthStatus.network.errors + 1
      };
    }
  }

  // System health check
  private async checkSystemHealth(): Promise<void> {
    try {
      // Check system resources
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        
        this.healthStatus.system = {
          memoryUsage,
          cpuUsage: 0, // CPU usage not available in browser
          lastCheck: new Date(),
          errors: memoryUsage > HEALTH_THRESHOLDS.system.maxMemoryUsage ? 
            this.healthStatus.system.errors + 1 : 0
        };
      }
    } catch (error) {
      this.healthStatus.system = {
        memoryUsage: 0,
        cpuUsage: 0,
        lastCheck: new Date(),
        errors: this.healthStatus.system.errors + 1
      };
    }
  }

  // Notify all callbacks
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.healthStatus);
      } catch (error) {
        console.error('Health update callback failed:', error);
      }
    });
  }

  // Check if system is healthy
  isHealthy(): boolean {
    const { database, ui, network, system } = this.healthStatus;
    
    return (
      database.connected &&
      database.responseTime <= HEALTH_THRESHOLDS.database.maxResponseTime &&
      database.errors <= HEALTH_THRESHOLDS.database.maxErrors &&
      ui.rendered &&
      ui.renderTime <= HEALTH_THRESHOLDS.ui.maxRenderTime &&
      ui.errors <= HEALTH_THRESHOLDS.ui.maxErrors &&
      network.connected &&
      network.speed >= HEALTH_THRESHOLDS.network.minSpeed &&
      network.errors <= HEALTH_THRESHOLDS.network.maxErrors &&
      system.memoryUsage <= HEALTH_THRESHOLDS.system.maxMemoryUsage
    );
  }

  // Get specific health issues
  getHealthIssues(): string[] {
    const issues: string[] = [];
    const { database, ui, network, system } = this.healthStatus;
    
    if (!database.connected) issues.push('Database disconnected');
    if (database.responseTime > HEALTH_THRESHOLDS.database.maxResponseTime) {
      issues.push('Database slow response');
    }
    if (!ui.rendered) issues.push('UI not rendered');
    if (ui.renderTime > HEALTH_THRESHOLDS.ui.maxRenderTime) {
      issues.push('UI render slow');
    }
    if (!network.connected) issues.push('Network disconnected');
    if (network.speed < HEALTH_THRESHOLDS.network.minSpeed) {
      issues.push('Network slow');
    }
    if (system.memoryUsage > HEALTH_THRESHOLDS.system.maxMemoryUsage) {
      issues.push('High memory usage');
    }
    
    return issues;
  }
}
