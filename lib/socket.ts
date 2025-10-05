import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false

  connect() {
    if (this.socket?.connected) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      this.isConnected = false
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  joinWheelRoom() {
    if (this.socket?.connected) {
      this.socket.emit('join-wheel')
    }
  }

  joinAdminRoom() {
    if (this.socket?.connected) {
      this.socket.emit('join-admin')
    }
  }

  onCountdownUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('countdown-update', callback)
    }
  }

  onCountdownExpired(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('countdown-expired', callback)
    }
  }

  onGameSettingsUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('game-settings-updated', callback)
    }
  }

  onWinnerDeclared(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('winner-declared', callback)
    }
  }

  onPasswordChangedLogout(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('password-changed-logout', callback)
    }
  }

  removeListener(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.removeAllListeners(event)
      }
    }
  }

  get connected() {
    return this.isConnected && this.socket?.connected
  }
}

export const socketService = new SocketService()
