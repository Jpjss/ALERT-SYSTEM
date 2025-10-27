# 🔧 Correção de Erros - Instalação de Dependências

## Problema 1: Node.js não instalado

Você precisa instalar o Node.js para rodar o projeto Next.js.

### Solução:

1. **Baixe o Node.js**: https://nodejs.org/
2. **Instale a versão LTS** (recomendado)
3. **Marque a opção** "Add to PATH" durante a instalação
4. **Reinicie o PowerShell** após a instalação

### Verificar instalação:
```powershell
node --version
npm --version
```

---

## Problema 2: Dependências do Mapa

Após instalar o Node.js, execute:

```powershell
cd "c:\Users\N1\Desktop\projeto teste\ALERT SYSTEM"
npm install
npm install leaflet react-leaflet @types/leaflet
```

---

## Problema 3: Favicon 404

Crie um favicon real usando um desses métodos:

### Opção 1: Online (Rápido)
1. Acesse: https://favicon.io/
2. Crie seu favicon
3. Baixe o arquivo `favicon.ico`
4. Coloque em: `c:\Users\N1\Desktop\projeto teste\ALERT SYSTEM\app\favicon.ico`

### Opção 2: Usar imagem existente
```powershell
# Se você tem um logo PNG/JPG
# Converta para .ico em: https://convertio.co/pt/png-ico/
```

---

## ✅ Comandos para Rodar o Projeto

Depois de instalar tudo:

```powershell
cd "c:\Users\N1\Desktop\projeto teste\ALERT SYSTEM"
npm run dev
```

Acesse: http://localhost:3000

---

## 🗺️ Funcionalidades do Mapa

O mapa agora inclui:

- ✅ **Visualização de clientes** por localização geográfica
- ✅ **Marcadores coloridos** por status:
  - 🟢 Verde = Online
  - 🟠 Laranja = Alerta
  - 🟡 Amarelo = Sem Internet
  - 🔴 Vermelho = Offline
- ✅ **Popups com informações** ao clicar nos marcadores
- ✅ **Legenda** explicativa no canto inferior direito
- ✅ **Integração com API** para dados em tempo real

---

## 📋 Checklist de Instalação

- [ ] Instalar Node.js
- [ ] Reiniciar PowerShell
- [ ] Executar `npm install`
- [ ] Instalar dependências do mapa: `npm install leaflet react-leaflet @types/leaflet`
- [ ] Criar/baixar favicon.ico
- [ ] Executar `npm run dev`
- [ ] Acessar http://localhost:3000

---

## 🐛 Troubleshooting

### Erro: "npm não é reconhecido"
- Reinstale o Node.js
- Reinicie o computador
- Verifique variáveis de ambiente PATH

### Erro: "Module not found: Can't resolve 'react-leaflet'"
```powershell
npm install leaflet react-leaflet @types/leaflet --force
```

### Mapa não carrega
- Verifique se está na aba "Mapa de Clientes"
- Abra o console do navegador (F12) para ver erros
- Certifique-se que as dependências foram instaladas

---

## 🎨 Personalizar Localizações

Edite o arquivo: `components/client-map.tsx`

```typescript
const MOCK_LOCATIONS: ClientLocation[] = [
  { 
    id: 'CLI001', 
    name: 'Sua Loja', 
    lat: -23.5505,  // Sua latitude
    lng: -46.6333,  // Sua longitude
    status: 'Online', 
    alerts: 0 
  },
  // Adicione mais clientes...
]
```

**Como encontrar coordenadas:**
1. Abra Google Maps
2. Clique com botão direito no local
3. Clique na latitude/longitude para copiar
