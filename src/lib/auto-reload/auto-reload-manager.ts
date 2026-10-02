import { 
  AutoReloadState, 
  ProblemType, 
  RecoveryStatus, 
  AutoReloadConfig, 
  RecoveryMetrics 
} from './types';
import { DEFAULT_AUTO_RELOAD_CONFIG, RECOVERY_STRATEGIES } from './config';
import { ErrorClassifier } from './error-classifier';
import { HealthMonitor } from './health-monitor';

// Main Auto-Reload Manager
export class AutoReloadManager {
  private state: AutoReloadState;
  private healthMonitor: HealthMonitor;
  private recoveryCallbacks: ((problem: ProblemType, status: RecoveryStatus) => void)[] = [];
  private isRecovering: boolean = false;

  constructor(config: Partial<AutoReloadConfig> = {}) {
    this.state = {
      status: RecoveryStatus.DETECTING,
      currentProblem: null,
      retryCount: 0,
      lastError: null,
      metrics: {
        totalAttempts: 0,
        successfulRecoveries: 0,
        failedRecoveries: 0,
        averageRecoveryTime: 0,
        lastRecoveryTime: null,
        problemTypes: {
          [ProblemType.DATABASE_LOADING]: 0,
          [ProblemType.BROWSER_UI_FAIL]: 0,
          [ProblemType.APP_INFRASTRUCTURE]: 0,
          [ProblemType.NETWORK_CONNECTIVITY]: 0,
          [ProblemType.SYSTEM_OVERLOAD]: 0
        }
      },
      config: { ...DEFAULT_AUTO_RELOAD_CONFIG, ...config },
      healthStatus: {
        database: { connected: false, responseTime: 0, lastCheck: new Date(), errors: 0 },
        ui: { rendered: false, renderTime: 0, lastCheck: new Date(), errors: 0 },
        network: { connected: false, speed: 0, lastCheck: new Date(), errors: 0 },
        system: { memoryUsage: 0, cpuUsage: 0, lastCheck: new Date(), errors: 0 }
      },
      isAutoReloadEnabled: true
    };

    this.healthMonitor = new HealthMonitor();
    this.setupHealthMonitoring();
  }

  // Start auto-reload system
  start(): void {
    this.state.isAutoReloadEnabled = true;
    this.healthMonitor.startMonitoring(this.state.config.healthCheckInterval);
    
    console.log('🚀 Auto-Reload System Started');
    console.log('📊 Monitoring:', Object.keys(ProblemType));
    console.log('⚙️  Config:', this.state.config);
  }

  // Stop auto-reload system
  stop(): void {
    this.state.isAutoReloadEnabled = false;
    this.healthMonitor.stopMonitoring();
    
    console.log('🛑 Auto-Reload System Stopped');
  }

  // Handle error and trigger auto-reload
  async handleError(error: Error | string): Promise<boolean> {
    if (!this.state.isAutoReloadEnabled || this.isRecovering) {
      return false;
    }

    const problemType = ErrorClassifier.classifyError(error);
    const strategy = RECOVERY_STRATEGIES[problemType];

    console.log(`🔍 Error Detected: ${problemType}`);
    console.log(`📋 Strategy: ${strategy.strategy}`);
    console.log(`🔄 Attempt: ${this.state.retryCount + 1}/${strategy.maxRetries}`);

    this.state.currentProblem = problemType;
    this.state.lastError = typeof error === 'string' ? new Error(error) : error;
    this.state.status = RecoveryStatus.RECOVERING;
    this.state.metrics.totalAttempts++;
    this.state.metrics.problemTypes[problemType]++;

    // Notify callbacks
    this.notifyRecoveryCallbacks(problemType, RecoveryStatus.RECOVERING);

    try {
      const recovered = await this.performRecovery(problemType, strategy);
      
      if (recovered) {
        this.handleRecoverySuccess(problemType);
        return true;
      } else {
        this.handleRecoveryFailure(problemType);
        return false;
      }
    } catch (recoveryError) {
      console.error('💥 Recovery failed:', recoveryError);
      this.handleRecoveryFailure(problemType);
      return false;
    }
  }

  // Perform recovery based on problem type
  private async performRecovery(problemType: ProblemType, strategy: any): Promise<boolean> {
    this.isRecovering = true;
    const startTime = Date.now();

    try {
      switch (problemType) {
        case ProblemType.DATABASE_LOADING:
          return await this.recoverDatabase(strategy);
        
        case ProblemType.BROWSER_UI_FAIL:
          return await this.recoverUI(strategy);
        
        case ProblemType.APP_INFRASTRUCTURE:
          return await this.recoverInfrastructure(strategy);
        
        case ProblemType.NETWORK_CONNECTIVITY:
          return await this.recoverNetwork(strategy);
        
        case ProblemType.SYSTEM_OVERLOAD:
          return await this.recoverSystem(strategy);
        
        default:
          return await this.defaultRecovery(strategy);
      }
    } finally {
      const recoveryTime = Date.now() - startTime;
      this.updateMetrics(recoveryTime);
      this.isRecovering = false;
    }
  }

  // Database recovery
  private async recoverDatabase(strategy: any): Promise<boolean> {
    console.log('🗄️  Recovering Database...');
    
    // Try to reconnect to database
    for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
      try {
        const response = await fetch('/api/health/database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reconnect' })
        });
        
        if (response.ok) {
          console.log('✅ Database recovered successfully');
          return true;
        }
      } catch (error) {
        console.log(`❌ Database recovery attempt ${attempt} failed:`, error);
      }
      
      // Wait before next attempt
      await this.delay(ErrorClassifier.getRetryDelay(attempt, strategy.retryDelay));
    }
    
    return false;
  }

  // UI recovery
  private async recoverUI(strategy: any): Promise<boolean> {
    console.log('🎨 Recovering UI...');
    
    try {
      // Force UI re-render
      if (typeof window !== 'undefined') {
        // Clear any cached data
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Force page reload if needed
        if (strategy.strategy === 'force_rerender') {
          window.location.reload();
          return true;
        }
        
        // Try to recover specific components
        const criticalElements = document.querySelectorAll('[data-critical="true"]');
        if (criticalElements.length === 0) {
          // Force re-render of missing critical elements
          this.forceRerenderCriticalElements();
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ UI recovery failed:', error);
    }
    
    return false;
  }

  // Infrastructure recovery
  private async recoverInfrastructure(strategy: any): Promise<boolean> {
    console.log('🏗️  Recovering Infrastructure...');
    
    try {
      // Restart services or refresh app state
      const response = await fetch('/api/health/infrastructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart_services' })
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Infrastructure recovery failed:', error);
      return false;
    }
  }

  // Network recovery
  private async recoverNetwork(strategy: any): Promise<boolean> {
    console.log('🌐 Recovering Network...');
    
    try {
      // Check network connectivity
      const response = await fetch('/api/health/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reconnect' })
      });
      
      if (response.ok) {
        console.log('✅ Network recovered successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Network recovery failed:', error);
    }
    
    return false;
  }

  // System recovery
  private async recoverSystem(strategy: any): Promise<boolean> {
    console.log('💻 Recovering System...');
    
    try {
      // Reduce system load
      if (typeof window !== 'undefined') {
        // Clear unnecessary data
        localStorage.clear();
        sessionStorage.clear();
        
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ System recovery failed:', error);
    }
    
    return false;
  }

  // Default recovery
  private async defaultRecovery(strategy: any): Promise<boolean> {
    console.log('🔄 Default Recovery...');
    
    try {
      // General recovery approach
      await this.delay(strategy.retryDelay);
      
      // Check if system is healthy now
      return this.healthMonitor.isHealthy();
    } catch (error) {
      console.error('❌ Default recovery failed:', error);
      return false;
    }
  }

  // Force re-render of critical elements
  private forceRerenderCriticalElements(): void {
    const criticalElements = document.querySelectorAll('[data-critical="true"]');
    criticalElements.forEach(element => {
      const parent = element.parentNode;
      if (parent) {
        const clone = element.cloneNode(true);
        parent.replaceChild(clone, element);
      }
    });
  }

  // Handle successful recovery
  private handleRecoverySuccess(problemType: ProblemType): void {
    this.state.status = RecoveryStatus.SUCCESS;
    this.state.retryCount = 0;
    this.state.metrics.successfulRecoveries++;
    this.state.metrics.lastRecoveryTime = new Date();
    
    console.log(`✅ Recovery successful for ${problemType}`);
    
    // Notify callbacks
    this.notifyRecoveryCallbacks(problemType, RecoveryStatus.SUCCESS);
    
    // Show success notification
    if (this.state.config.enableNotifications) {
      this.showNotification('✅ System recovered successfully!', 'success');
    }
  }

  // Handle recovery failure
  private handleRecoveryFailure(problemType: ProblemType): void {
    this.state.status = RecoveryStatus.FAILED;
    this.state.retryCount++;
    this.state.metrics.failedRecoveries++;
    
    console.log(`❌ Recovery failed for ${problemType}`);
    
    // Notify callbacks
    this.notifyRecoveryCallbacks(problemType, RecoveryStatus.FAILED);
    
    // Show failure notification
    if (this.state.config.enableNotifications) {
      this.showNotification('❌ System recovery failed. Please try manually.', 'error');
    }
  }

  // Update recovery metrics
  private updateMetrics(recoveryTime: number): void {
    const totalRecoveries = this.state.metrics.successfulRecoveries + this.state.metrics.failedRecoveries;
    this.state.metrics.averageRecoveryTime = 
      (this.state.metrics.averageRecoveryTime * (totalRecoveries - 1) + recoveryTime) / totalRecoveries;
  }

  // Setup health monitoring
  private setupHealthMonitoring(): void {
    this.healthMonitor.onHealthUpdate((healthStatus) => {
      this.state.healthStatus = healthStatus;
      
      // Check if health issues require recovery
      if (!this.healthMonitor.isHealthy() && this.state.isAutoReloadEnabled) {
        const issues = this.healthMonitor.getHealthIssues();
        console.log('⚠️ Health issues detected:', issues);
        
        // Trigger recovery based on health issues
        this.handleHealthIssues(issues);
      }
    });
  }

  // Handle health issues
  private handleHealthIssues(issues: string[]): void {
    for (const issue of issues) {
      if (issue.includes('Database')) {
        this.handleError(new Error('Database health issue detected'));
        break;
      } else if (issue.includes('UI')) {
        this.handleError(new Error('UI health issue detected'));
        break;
      } else if (issue.includes('Network')) {
        this.handleError(new Error('Network health issue detected'));
        break;
      }
    }
  }

  // Notify recovery callbacks
  private notifyRecoveryCallbacks(problem: ProblemType, status: RecoveryStatus): void {
    this.recoveryCallbacks.forEach(callback => {
      try {
        callback(problem, status);
      } catch (error) {
        console.error('Recovery callback failed:', error);
      }
    });
  }

  // Show notification
  private showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium ${
      type === 'success' ? 'bg-green-500/90 text-white' :
      type === 'error' ? 'bg-red-500/90 text-white' :
      'bg-yellow-500/90 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current state
  getState(): AutoReloadState {
    return { ...this.state };
  }

  // Get health monitor
  getHealthMonitor(): HealthMonitor {
    return this.healthMonitor;
  }

  // Subscribe to recovery events
  onRecovery(callback: (problem: ProblemType, status: RecoveryStatus) => void): void {
    this.recoveryCallbacks.push(callback);
  }

  // Unsubscribe from recovery events
  offRecovery(callback: (problem: ProblemType, status: RecoveryStatus) => void): void {
    const index = this.recoveryCallbacks.indexOf(callback);
    if (index > -1) {
      this.recoveryCallbacks.splice(index, 1);
    }
  }
}
