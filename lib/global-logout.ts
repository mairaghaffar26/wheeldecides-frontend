import { socketService } from './socket'

class GlobalLogoutService {
  private static instance: GlobalLogoutService
  private logoutCallbacks: Array<() => void> = []

  static getInstance(): GlobalLogoutService {
    if (!GlobalLogoutService.instance) {
      GlobalLogoutService.instance = new GlobalLogoutService()
    }
    return GlobalLogoutService.instance
  }

  constructor() {
    this.setupGlobalLogoutListener()
  }

  private setupGlobalLogoutListener() {
    // Listen for password changed logout events
    socketService.onPasswordChangedLogout((data: any) => {
      console.log('Password changed logout received:', data)
      this.performGlobalLogout()
    })
  }

  private performGlobalLogout() {
    // Clear all stored authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      sessionStorage.clear()
    }

    // Execute all registered logout callbacks
    this.logoutCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Error in logout callback:', error)
      }
    })

    // Redirect to login page
    if (typeof window !== 'undefined') {
      // Show a notification before redirecting
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 300px;
      `
      notification.textContent = 'Password has been changed. Redirecting to login...'
      document.body.appendChild(notification)

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 2000)
    }
  }

  // Register a callback to be called during logout
  registerLogoutCallback(callback: () => void) {
    this.logoutCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.logoutCallbacks.indexOf(callback)
      if (index > -1) {
        this.logoutCallbacks.splice(index, 1)
      }
    }
  }

  // Manual logout trigger
  logout() {
    this.performGlobalLogout()
  }
}

export const globalLogoutService = GlobalLogoutService.getInstance()
