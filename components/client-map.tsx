'use client'

import { useEffect, useState, useRef } from 'react'

interface ClientLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: string
  alerts?: number
}

// Função para criar ícones customizados por status com nome do cliente
const createCustomIcon = (status: string, name: string, L: any) => {
  // Só executa no cliente
  if (typeof window === 'undefined' || !L || !L.divIcon) {
    console.warn('Leaflet não está disponível para criar ícone')
    return null
  }

  try {
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
  } catch (error) {
    console.error('Erro ao criar ícone customizado:', error)
    return null
  }
}

// Função auxiliar para obter cor do status
const getStatusColor = (status: string) => {
  const colors = {
    'Online': '#22c55e',
    'Alerta': '#f97316',
    'Sem Internet': '#eab308',
    'Offline': '#ef4444',
  } as const
  return colors[status as keyof typeof colors] || '#6b7280'
}

export function ClientMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const initializingRef = useRef(false)
  const mountedRef = useRef(false)
  const [renderReady, setRenderReady] = useState(false)
  const [locations, setLocations] = useState<ClientLocation[]>([])
  const [refreshInterval, setRefreshInterval] = useState(10000)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  const fetchLocations = async () => {
    try {
      console.log('📡 Fazendo requisição para /api/status/all...')
      const response = await fetch('/api/status/all')
      console.log('📨 Resposta recebida:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Dados recebidos:', data.length, 'clientes')
        setLocations(data)
        setMapError(null)
      } else {
        console.error('❌ Erro na resposta da API:', response.status)
        setMapError('Erro ao carregar dados dos clientes')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar localizações:', error)
      setMapError('Erro de conexão com o servidor')
    }
  }

  const initializeMap = async () => {
    // Verificações de segurança
    if (!mapRef.current) {
      console.log('❌ mapRef.current não está disponível')
      return false
    }

    if (initializingRef.current) {
      console.log('⚠️ Inicialização já em andamento, ignorando...')
      return false
    }

    if (leafletMapRef.current) {
      console.log('✅ Mapa já inicializado')
      return true
    }

    try {
      console.log('🗺️ Iniciando inicialização do mapa...')
      initializingRef.current = true

      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        console.log('📦 Carregando Leaflet CSS...')
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
        
        await new Promise((resolve) => {
          link.onload = () => {
            console.log('✅ CSS carregado')
            resolve(true)
          }
          setTimeout(resolve, 2000)
        })
      }

      console.log('📦 Carregando Leaflet JS...')
      const L = await import('leaflet')
      const leaflet = (L as any).default ?? L
      console.log('✅ Leaflet carregado')

      // Configure default icons
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      console.log('🗺️ Criando instância do mapa...')
      const map = leaflet.map(mapRef.current).setView([-23.5505, -46.6333], 8)
      leafletMapRef.current = map
      console.log('✅ Mapa criado')

      console.log('🌍 Adicionando camada de tiles...')
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      console.log('📍 Buscando localizações...')
      await fetchLocations()
      
      console.log('🎉 Mapa inicializado com sucesso!')
      setIsLoading(false)
      setMapReady(true)
      initializingRef.current = false
      return true
    } catch (error) {
      console.error('❌ Erro ao inicializar mapa:', error)
      setMapError('Erro ao inicializar o mapa. Verifique sua conexão com a internet.')
      setIsLoading(false)
      initializingRef.current = false
      return false
    }
  }

  const displayLocations = (map: any, L: any) => {
    if (!map || !locations.length) {
      console.log('⚠️ displayLocations: map ou locations não disponíveis', { 
        hasMap: !!map, 
        locationsLength: locations.length 
      })
      return
    }

    console.log('📍 Exibindo', locations.length, 'marcadores no mapa')

    // Clear existing markers
    let markersCleared = 0
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
        markersCleared++
      }
    })
    
    if (markersCleared > 0) {
      console.log('🧹 Removidos', markersCleared, 'marcadores antigos')
    }

    let markersAdded = 0
    locations.forEach((location) => {
      try {
        const icon = createCustomIcon(location.status, location.name, L)
        if (icon) {
          const marker = L.marker([location.lat, location.lng], { icon }).addTo(map)

          const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${location.name}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 8px;">ID: ${location.id}</p>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${getStatusColor(location.status)};"></span>
                <span style="font-size: 12px; font-weight: 500;">${location.status}</span>
              </div>
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #666;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Latitude:</span>
                  <span style="font-family: monospace;">${location.lat.toFixed(4)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Longitude:</span>
                  <span style="font-family: monospace;">${location.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          `

          marker.bindPopup(popupContent)
          markersAdded++
        } else {
          console.warn('⚠️ Ícone não pôde ser criado para', location.name)
        }
      } catch (error) {
        console.error('❌ Erro ao criar marcador para', location.name, error)
      }
    })
    
    console.log('✅ Total de', markersAdded, 'marcadores adicionados ao mapa')
  }

  useEffect(() => {
    if (mountedRef.current) {
      console.log('⚠️ Componente já foi montado, evitando re-montagem')
      return
    }

    console.log('🚀 Componente montado pela primeira vez')
    mountedRef.current = true
    setRenderReady(true)

    // Load refresh interval from settings
    const savedSettings = localStorage.getItem("alertSystemSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.autoRefresh !== false) {
          const interval = parseInt(settings.refreshInterval || "10") * 1000
          setRefreshInterval(interval)
          console.log('⏱️ Intervalo de refresh configurado:', interval, 'ms')
        }
      } catch (e) {
        console.error("❌ Erro ao carregar configurações:", e)
      }
    }

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      const settings = event.detail
      if (settings.autoRefresh !== false) {
        const interval = parseInt(settings.refreshInterval || "10") * 1000
        setRefreshInterval(interval)
        console.log('⏱️ Intervalo de refresh atualizado:', interval, 'ms')
      }
    }

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener)

    // Inicializar mapa após um delay
    const initTimer = setTimeout(() => {
      if (mapRef.current && !leafletMapRef.current) {
        console.log('🎬 Iniciando inicialização do mapa...')
        initializeMap()
      }
    }, 500)

    return () => {
      console.log('🧹 Limpeza do componente')
      clearTimeout(initTimer)
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current && mountedRef.current) {
        console.log('🗑️ Removendo mapa no desmonte')
        try {
          leafletMapRef.current.remove()
          leafletMapRef.current = null
        } catch (e) {
          console.error('❌ Erro ao remover mapa:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (leafletMapRef.current && locations.length > 0) {
      console.log('🔄 Atualizando marcadores com', locations.length, 'localizações')
      import('leaflet').then((L) => {
        const leaflet = (L as any).default ?? L
        displayLocations(leafletMapRef.current, leaflet)
      }).catch((error) => {
        console.error('❌ Erro ao atualizar marcadores:', error)
      })
    }
  }, [locations])

  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) {
      console.log('⏸️ Polling pausado - mapa não está pronto')
      return
    }

    console.log('⏱️ Configurando polling com intervalo:', refreshInterval, 'ms')
    const intervalId = setInterval(() => {
      console.log('🔄 Atualizando dados via polling...')
      fetchLocations()
    }, refreshInterval)

    return () => {
      console.log('🛑 Limpando intervalo de polling')
      clearInterval(intervalId)
    }
  }, [refreshInterval, mapReady])

  const getStatusBadge = (status: ClientLocation['status']) => {
    const lowerCaseStatus = status.toLowerCase()
    if (lowerCaseStatus.includes('alerta')) return 'bg-orange-500'
    if (lowerCaseStatus.includes('online')) return 'bg-green-500'
    if (lowerCaseStatus.includes('sem internet')) return 'bg-yellow-500'
    if (lowerCaseStatus.includes('offline')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  if (!renderReady || isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-lg">Carregando mapa...</p>
        <p className="text-muted-foreground text-sm mt-2">Preparando visualização de clientes</p>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
        <div className="text-red-500 text-lg mb-4">Erro ao carregar o mapa</div>
        <p className="text-muted-foreground text-sm">{mapError}</p>
        <p className="text-muted-foreground text-xs mt-2">Verifique sua conexão com a internet e tente novamente</p>
        <button
          onClick={() => initializeMap()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
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

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

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
