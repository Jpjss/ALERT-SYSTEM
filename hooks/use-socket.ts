'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Só inicializar no cliente
    if (typeof window === 'undefined') return

    // Inicializar socket se não existir
    if (!socket) {
      socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
        transports: ['websocket', 'polling']
      })

      socket.on('connect', () => {
        console.log('Conectado ao servidor Socket.IO')
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('Desconectado do servidor Socket.IO')
        setIsConnected(false)
      })
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.off('connect')
        socket.off('disconnect')
      }
    }
  }, [])

  const joinAlerts = () => {
    if (socket) {
      socket.emit('join-alerts')
    }
  }

  const joinStatus = () => {
    if (socket) {
      socket.emit('join-status')
    }
  }

  const onAlertUpdate = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('alert-update', callback)
      return () => socket?.off('alert-update', callback)
    }
  }

  const onStatusUpdate = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('status-update', callback)
      return () => socket?.off('status-update', callback)
    }
  }

  return {
    socket,
    isConnected,
    joinAlerts,
    joinStatus,
    onAlertUpdate,
    onStatusUpdate
  }
}