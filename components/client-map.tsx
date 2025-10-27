'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Importa o mapa de forma dinâmica para evitar problemas de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface ClientLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: string
  alerts?: number
}

// Função para criar ícones customizados por status com nome do cliente
const createCustomIcon = (status: string, name: string) => {
  // Só executa no cliente
  if (typeof window === 'undefined') return null
  
  const L = require('leaflet')
  
  const colors = {
    'Online': '#22c55e',
    'Alerta': '#f97316',
    'Sem Internet': '#eab308',
    'Offline': '#ef4444',
  } as const

  const color = colors[status as keyof typeof colors] || '#6b7280'

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background-color: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          margin-bottom: 4px;
        ">${name}</div>
        <div style="
          background-color: rgba(0, 0, 0, 0.75);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          margin-bottom: 6px;
        ">${status}</div>
        <div style="
          width: 20px;
          height: 20px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>
      </div>
    `,
    iconSize: [120, 80],
    iconAnchor: [60, 80],
  })
}

export function ClientMap() {
  const [mounted, setMounted] = useState(false)
  const [locations, setLocations] = useState<ClientLocation[]>([])
  const [refreshInterval, setRefreshInterval] = useState(10000)

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/status/all')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Erro ao buscar localizações:', error)
    }
  }

  useEffect(() => {
    setMounted(true)
    
    // Load refresh interval from settings
    const savedSettings = localStorage.getItem("alertSystemSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.autoRefresh !== false) {
        const interval = parseInt(settings.refreshInterval || "10") * 1000
        setRefreshInterval(interval)
      }
    }

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      const settings = event.detail
      if (settings.autoRefresh !== false) {
        const interval = parseInt(settings.refreshInterval || "10") * 1000
        setRefreshInterval(interval)
      }
    }

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener)
    
    // Import Leaflet CSS
    if (typeof window !== 'undefined') {
      // Carrega o CSS do Leaflet via CDN (evita restrição de CSS global do Next.js)
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Carrega o pacote leaflet e ajusta os caminhos dos ícones padrão
      import('leaflet')
        .then((mod) => {
          const L = (mod as any).default ?? mod
          // Remove _getIconUrl se existir e ajusta as URLs dos ícones para o CDN
          try {
            delete (L.Icon.Default.prototype as any)._getIconUrl
          } catch {}
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          })
        })
        .catch((err) => console.error('Erro ao carregar leaflet:', err))
    }

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener)
    }
  }, [])

  useEffect(() => {
    // Fetch initial data
    fetchLocations()

    // Set up polling to refresh data
    const intervalId = setInterval(fetchLocations, refreshInterval)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [refreshInterval])

  const getMarkerColor = (status: ClientLocation['status']) => {
    switch (status) {
      case 'Online': return 'green'
      case 'Alerta': return 'orange'
      case 'Sem Internet': return 'yellow'
      case 'Offline': return 'red'
      default: return 'gray'
    }
  }

  const getStatusBadge = (status: ClientLocation['status']) => {
    const lowerCaseStatus = status.toLowerCase()
    if (lowerCaseStatus.includes('alerta')) return 'bg-orange-500'
    if (lowerCaseStatus.includes('online')) return 'bg-green-500'
    if (lowerCaseStatus.includes('sem internet')) return 'bg-yellow-500'
    if (lowerCaseStatus.includes('offline')) return 'bg-red-500' // Assuming offline might be a status
    return 'bg-gray-500'
  }

  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-lg">Carregando mapa...</p>
        <p className="text-muted-foreground text-sm mt-2">Preparando visualização de clientes</p>
      </div>
    )
  }

  // Count clients by status
  const statusCounts = locations.reduce((acc, loc) => {
    acc[loc.status] = (acc[loc.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="w-full h-full relative">
      {/* Stats Header */}
      <div className="absolute top-4 left-4 z-[1000] bg-card border border-border rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Clientes Monitorados
        </h3>
        <div className="text-2xl font-bold text-primary">{locations.length}</div>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online
            </span>
            <span className="font-semibold">{statusCounts['Online'] || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Alerta
            </span>
            <span className="font-semibold">{statusCounts['Alerta'] || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Sem Internet
            </span>
            <span className="font-semibold">{statusCounts['Sem Internet'] || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Offline
            </span>
            <span className="font-semibold">{statusCounts['Offline'] || 0}</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[-26.8, -48.9]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <style>{`
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
        `}</style>
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.status, location.name)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">ID: {location.id}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusBadge(location.status)}`} />
                  <span className="text-xs font-medium">{location.status}</span>
                </div>
                <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Latitude:</span>
                    <span className="font-mono">{location.lat.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude:</span>
                    <span className="font-mono">{location.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legenda */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000]">
        <h4 className="text-xs font-semibold mb-2">Status dos Clientes</h4>
        <div className="space-y-1">
          {(['Online', 'Alerta', 'Sem Internet', 'Offline'] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getStatusBadge(status)}`} />
              <span className="text-xs">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
