'use client'

import { useEffect, useRef, useState } from 'react'

interface ClientLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: string
}

export function MapView() {
  const [isReady, setIsReady] = useState(false)
  const [clients, setClients] = useState<ClientLocation[]>([])
  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  // Step 1: Load clients from API
  useEffect(() => {
    fetch('/api/status/all')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Clientes carregados:', data.length)
        setClients(data)
      })
      .catch(err => console.error('❌ Erro ao carregar clientes:', err))
  }, [])

  // Step 2: Initialize map only when DOM is ready
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) {
      console.log('⏭️ Pulando inicialização (mapa já existe ou div não disponível)')
      return
    }

    console.log('🎬 Iniciando mapa...')

    const initializeMap = async () => {
      try {
        // Load Leaflet CSS if not already loaded
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
          console.log('📦 CSS carregado')
        }

        // Import Leaflet
        const L = await import('leaflet')
        const leaflet = (L as any).default || L
        console.log('📦 Leaflet importado')

        // Check if container still exists
        if (!mapDivRef.current) {
          console.error('❌ Container foi removido')
          return
        }

        // Configure icons
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        // Create map
        const map = leaflet.map(mapDivRef.current, {
          center: [-23.5505, -46.6333],
          zoom: 7,
          zoomControl: true,
          attributionControl: true,
        })
        console.log('🗺️ Mapa criado')

        // Add tile layer
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map)
        console.log('🌍 Tiles adicionados')

        mapRef.current = {
          instance: map,
          leaflet: leaflet,
          markers: [],
        }
        console.log('🎉 Mapa pronto!')
        setIsReady(true)
      } catch (err) {
        console.error('❌ Erro ao inicializar mapa:', err)
      }
    }

    // Start initialization
    initializeMap()
  }, [])

  // Step 3: Update markers when clients change
  useEffect(() => {
    if (!mapRef.current || !isReady) {
      console.log('⏸️ Aguardando mapa estar pronto...')
      return
    }

    const { instance, leaflet, markers } = mapRef.current

    console.log('🔄 Atualizando marcadores...')

    // Remove old markers
    markers.forEach((marker: any) => {
      try {
        instance.removeLayer(marker)
      } catch (e) {
        // Ignore
      }
    })
    mapRef.current.markers = []

    // Add new markers
    let count = 0
    clients.forEach((client) => {
      const color =
        client.status === 'Online'
          ? '#22c55e'
          : client.status === 'Alerta'
            ? '#f97316'
            : client.status === 'Sem Internet'
              ? '#eab308'
              : '#ef4444'

      const icon = leaflet.divIcon({
        html: `
          <div style="width: 16px; height: 16px; background: ${color}; border-radius: 50%;"></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = leaflet.marker([client.lat, client.lng], { icon }).addTo(instance)

      mapRef.current.markers.push(marker)
      count++
    })

    console.log('✅', count, 'marcadores adicionados')
  }, [clients, isReady])

  // Step 4: Auto-refresh clients
  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh disparado')
      fetch('/api/status/all')
        .then(res => res.json())
        .then(data => setClients(data))
        .catch(err => console.error('❌ Erro no refresh:', err))
    }, 10000)

    return () => clearInterval(interval)
  }, [isReady])

  const statusCounts = clients.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="w-full h-full relative">
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-[999]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Carregando mapa...</p>
          <p className="text-sm text-muted-foreground mt-2">
            {clients.length > 0 ? `Carregados ${clients.length} clientes` : 'Conectando ao servidor'}
          </p>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapDivRef}
        className="w-full h-full"
        style={{
          minHeight: '600px',
        }}
      />

      {/* Stats Card - only show when map is ready */}
      {isReady && (
        <div className="absolute top-4 left-4 z-[1000] bg-card border rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="text-sm font-semibold mb-2">Clientes Monitorados</h3>
          <div className="text-2xl font-bold mb-3">{clients.length}</div>
          <div className="space-y-1 text-xs">
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
      )}

      {/* Legend - only show when map is ready */}
      {isReady && (
        <div className="absolute bottom-4 right-4 bg-card border rounded-lg p-3 shadow-lg z-[1000]">
          <h4 className="text-xs font-semibold mb-2">Legenda</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs">Alerta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Sem Internet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs">Offline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
