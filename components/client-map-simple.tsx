'use client'

import { useEffect, useRef, useState } from 'react'

interface ClientLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: string
}

export function ClientMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<ClientLocation[]>([])

  // Fetch clients data
  const loadClients = async () => {
    try {
      console.log('🔄 Carregando dados dos clientes...')
      const res = await fetch('/api/status/all')
      if (res.ok) {
        const data = await res.json()
        console.log('✅ Dados recebidos:', data.length, 'clientes')
        setClients(data)
        return data
      } else {
        console.error('❌ Erro na resposta:', res.status)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err)
    }
    return []
  }

  // Initialize map
  useEffect(() => {
    let mounted = true
    let initTimeout: NodeJS.Timeout

    const initMap = async () => {
      console.log('🚀 Iniciando mapa...')
      
      if (!mapContainer.current) {
        console.log('⚠️ Container não disponível, tentando novamente em 500ms')
        initTimeout = setTimeout(initMap, 500)
        return
      }

      if (mapInstance.current) {
        console.log('✅ Mapa já inicializado')
        return
      }

      try {
        console.log('📦 Carregando Leaflet CSS...')
        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
          await new Promise(resolve => {
            link.onload = resolve
            setTimeout(resolve, 1000)
          })
        }
        console.log('✅ CSS carregado')

        console.log('📦 Carregando Leaflet JS...')
        // Dynamic import Leaflet
        const L = await import('leaflet')
        const leaflet = (L as any).default || L
        console.log('✅ Leaflet JS carregado')

        if (!mounted || !mapContainer.current) {
          console.log('⚠️ Componente desmontado durante carregamento')
          return
        }

        // Fix default marker icons
        console.log('🔧 Configurando ícones...')
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        // Create map centered on Brazil
        console.log('🗺️ Criando mapa...')
        const map = leaflet.map(mapContainer.current, {
          center: [-23.5505, -46.6333],
          zoom: 7,
          zoomControl: true,
        })
        mapInstance.current = map
        console.log('✅ Mapa criado')

        // Add tile layer
        console.log('🌍 Adicionando tiles...')
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)
        console.log('✅ Tiles adicionados')

        // Load initial data
        console.log('📍 Carregando dados iniciais...')
        const initialData = await loadClients()
        
        if (mounted && initialData.length > 0) {
          console.log('🎉 Inicialização completa!')
          setIsLoading(false)
        } else {
          console.log('⚠️ Sem dados ou componente desmontado')
          setIsLoading(false)
        }
      } catch (err) {
        console.error('❌ Erro na inicialização:', err)
        if (mounted) {
          setError('Erro ao carregar o mapa: ' + (err as Error).message)
          setIsLoading(false)
        }
      }
    }

    initTimeout = setTimeout(initMap, 300)

    return () => {
      console.log('🧹 Limpando componente...')
      mounted = false
      clearTimeout(initTimeout)
      if (mapInstance.current) {
        try {
          mapInstance.current.remove()
          mapInstance.current = null
        } catch (e) {
          console.error('❌ Erro ao remover mapa:', e)
        }
      }
    }
  }, [])

  // Update markers when clients change
  useEffect(() => {
    if (!mapInstance.current || clients.length === 0) {
      console.log('⏸️ Pulando atualização de marcadores (mapa ou dados não disponíveis)')
      return
    }

    const updateMarkers = async () => {
      try {
        console.log('🔄 Atualizando marcadores...')
        const L = await import('leaflet')
        const leaflet = (L as any).default || L
        const map = mapInstance.current

        // Clear existing markers
        markersRef.current.forEach(marker => {
          try {
            map.removeLayer(marker)
          } catch (e) {
            // Ignore errors
          }
        })
        markersRef.current = []
        console.log('🧹 Marcadores antigos removidos')

        // Add new markers
        let addedCount = 0
        clients.forEach((client) => {
          try {
            const color = client.status === 'Online' ? '#22c55e' : 
                         client.status === 'Alerta' ? '#f97316' :
                         client.status === 'Sem Internet' ? '#eab308' : '#ef4444'

            const icon = leaflet.divIcon({
              html: `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="background: rgba(0,0,0,0.8); color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; white-space: nowrap; margin-bottom: 4px;">
                    ${client.name}
                  </div>
                  <div style="width: 16px; height: 16px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                </div>
              `,
              className: '',
              iconSize: [100, 50],
              iconAnchor: [50, 50],
            })

            const marker = leaflet.marker([client.lat, client.lng], { icon }).addTo(map)
            markersRef.current.push(marker)
            
            marker.bindPopup(`
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600;">${client.name}</h3>
                <p style="margin: 4px 0; font-size: 12px;">ID: ${client.id}</p>
                <p style="margin: 4px 0; font-size: 12px;">Status: <span style="color: ${color}; font-weight: 600;">${client.status}</span></p>
              </div>
            `)
            addedCount++
          } catch (e) {
            console.error('❌ Erro ao criar marcador:', e)
          }
        })
        console.log('✅', addedCount, 'marcadores adicionados')
      } catch (err) {
        console.error('❌ Erro ao atualizar marcadores:', err)
      }
    }

    updateMarkers()
  }, [clients])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (isLoading || !mapInstance.current) {
      console.log('⏸️ Auto-refresh pausado (aguardando inicialização)')
      return
    }

    console.log('⏱️ Iniciando auto-refresh (10s)')
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh disparado')
      loadClients()
    }, 10000)
    
    return () => {
      console.log('🛑 Parando auto-refresh')
      clearInterval(interval)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Carregando mapa...</p>
        <p className="text-sm text-muted-foreground mt-2">Preparando visualização</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted p-8">
        <div className="text-red-500 text-lg mb-2">❌ Erro</div>
        <p className="text-sm text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Recarregar Página
        </button>
      </div>
    )
  }

  const statusCounts = clients.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="w-full h-full relative">
      {/* Stats Card */}
      <div className="absolute top-4 left-4 z-[1000] bg-card border rounded-lg p-4 shadow-lg">
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

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '400px' }} />

      {/* Legend */}
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
    </div>
  )
}
