# 🚨 Alert System - Painel de Monitoramento Técnico

## 1. Visão Geral

O **Alert System** é uma solução full-stack projetada para o monitoramento centralizado de alertas de negócios e métricas de sistemas de clientes. A plataforma consiste em um painel web interativo construído com Next.js e um conjunto de scripts de monitoramento em Python.

O sistema permite que operadores visualizem alertas em tempo real, analisem dados históricos, acompanhem o status de múltiplos clientes em um mapa geográfico e recebam notificações.

## 2. Arquitetura e Fluxo de Dados

O projeto é dividido em três componentes principais que interagem de forma coesa:

1.  **Painel Web (Next.js)**: O núcleo da aplicação, servindo tanto a interface do usuário (frontend) quanto a API de backend.
2.  **Monitor de Servidor (Python)**: Um script autônomo que verifica a lógica de negócios e o estado do banco de dados.
3.  **Monitor de Cliente (Python)**: Um agente leve instalado nos sistemas dos clientes para coletar métricas de hardware e software.

### Fluxo de Dados

-   **Métricas de Clientes**: O `client_monitor.py` coleta dados (CPU, disco, memória) e os envia para o endpoint `/api/metrics`. A API então armazena esses dados no PostgreSQL e os transmite via **Socket.IO** para o dashboard, atualizando a UI em tempo real.
-   **Alertas de Negócio**: O `monitor.py` executa verificações no banco de dados (ex: estoque baixo, backups falhos). Se uma condição de alerta é atendida, ele insere um novo registro na tabela de alertas. O painel web consulta e exibe esses alertas.

![Arquitetura do Sistema de Alertas (Diagrama Conceitual)](https://i.imgur.com/your-diagram-placeholder.png)
*(Nota: Substitua o link acima por um diagrama real da arquitetura)*

## 3. Stack de Tecnologia

| Componente              | Tecnologia                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend & Backend**  | [Next.js](https://nextjs.org/) 15 (App Router), [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/)                                                                         |
| **Banco de Dados**      | [PostgreSQL](https://www.postgresql.org/), [pg (node-postgres)](https://node-postgres.com/)                                                                                                          |
| **Comunicação Real-Time** | [Socket.IO](https://socket.io/)                                                                                                                                                                     |
| **UI & Estilização**    | [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)                                                |
| **Visualização de Dados** | [Recharts](https://recharts.org/) (Gráficos), [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/) (Mapas)                                                              |
| **Monitor de Servidor** | [Python](https://www.python.org/), `psycopg2-binary`, `requests`, `python-dotenv`                                                                                                                    |
| **Monitor de Cliente**  | [Python](https://www.python.org/), `psutil`, `requests`, `python-dotenv`                                                                                                                             |
| **Testes**              | [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Pytest](https://docs.pytest.org/)                                                 |
| **Gerenciador de Pacotes** | [pnpm](https://pnpm.io/)                                                                                                                                                                            |

---

## 4. Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (v20.x ou superior)
-   [pnpm](https://pnpm.io/installation)
-   [Python](https://www.python.org/downloads/) (v3.9 ou superior)
-   [PostgreSQL](https://www.postgresql.org/download/) (v14 ou superior)

---

## 5. Instalação e Configuração Local

Siga estes passos para configurar o ambiente de desenvolvimento completo.

### Passo 1: Banco de Dados (PostgreSQL)

1.  **Crie o banco de dados**:
    ```sh
    createdb alerts_db
    ```
2.  **Execute os scripts SQL** no diretório `scripts/` para criar o schema e popular os dados iniciais. **A ordem é importante.**
    ```sh
    psql -U SEU_USUARIO -d alerts_db -f scripts/001_create_alerts_schema.sql
    psql -U SEU_USUARIO -d alerts_db -f scripts/002_seed_alert_rules.sql
    psql -U SEU_USUARIO -d alerts_db -f scripts/003_seed_sample_data.sql
    psql -U SEU_USUARIO -d alerts_db -f scripts/004_create_client_status_table.sql
    psql -U SEU_USUARIO -d alerts_db -f scripts/005_create_metrics_history_table.sql
    ```

### Passo 2: Painel Web (Next.js)

1.  **Instale as dependências** do projeto na raiz:
    ```sh
    pnpm install
    ```
2.  **Configure as variáveis de ambiente**: Copie `.env.local.example` para `.env.local` e preencha a `POSTGRES_URL` e outras variáveis necessárias.
    ```sh
    cp .env.local.example .env.local
    ```

### Passo 3: Scripts de Monitoramento (Python)

1.  **Navegue até o diretório de scripts**:
    ```sh
    cd scripts
    ```
2.  **Crie e ative um ambiente virtual**:
    ```sh
    python -m venv venv
    # Linux/macOS:
    source venv/bin/activate
    # Windows:
    .\venv\Scripts\activate
    ```
3.  **Instale as dependências Python**:
    ```sh
    # Para o monitor principal do servidor
    pip install -r requirements.txt

    # Para o agente do cliente
    pip install -r requirements_client.txt
    ```
4.  **Configure as variáveis de ambiente**: Copie `scripts/.env.example` para `scripts/.env` e configure as variáveis para os scripts Python.

---

## 6. Executando a Aplicação

### Painel Web

-   **Modo de Desenvolvimento**: Inicia o servidor Next.js com hot-reloading.
    ```sh
    pnpm run dev:next
    ```
    Acesse [http://localhost:3000](http://localhost:3000).

-   **Build de Produção**: Compila e otimiza a aplicação para produção.
    ```sh
    pnpm build
    ```

-   **Iniciar em Produção**: Executa a build de produção.
    ```sh
    pnpm start
    ```

### Scripts de Monitoramento

-   **Execução Manual**: Para testes, você pode executar os monitores manualmente.
    ```sh
    # No diretório 'scripts/', com o venv ativado
    python monitor.py
    python client_monitor.py
    ```

-   **Execução Automática**:
    -   **Linux/macOS**: Use o script `setup_cron.sh` para configurar o `monitor.py` para rodar a cada 15 minutos.
    -   **Windows**: Use o Agendador de Tarefas para configurar a execução periódica de `monitor.py` e `client_monitor.py`.

---

## 7. Estrutura do Projeto

```
/
├── app/                # Código fonte do Next.js (App Router)
│   ├── api/            # Rotas da API (backend)
│   │   ├── alerts/
│   │   ├── metrics/
│   │   ├── notifications/
│   │   └── status/
│   ├── (pages)/        # Páginas da aplicação
│   └── layout.tsx      # Layout principal
├── components/         # Componentes React reutilizáveis
│   ├── ui/             # Componentes base (Shadcn/UI)
│   └── *.tsx           # Componentes da aplicação
├── hooks/              # Hooks React customizados
├── lib/                # Funções utilitárias e configuração de libs
├── public/             # Arquivos estáticos (imagens, fontes)
└── scripts/            # Scripts de monitoramento (Python) e automação
    ├── *.py            # Monitores de servidor e cliente
    ├── *.sql           # Scripts de banco de dados
    ├── requirements.txt # Dependências Python
    └── tests/          # Testes para os scripts Python
```

---

## 8. API Endpoints

As rotas da API estão definidas em `app/api/`. A estrutura de arquivos mapeia diretamente para os endpoints.

-   `POST /api/metrics`: Recebe novas métricas do `client_monitor.py`.
-   `GET /api/alerts`: Retorna a lista de alertas.
-   `GET /api/status`: Retorna o status agregado dos clientes.
-   `POST /api/notifications`: Envia uma notificação.

---

## 9. Testes

-   **Testes Unitários e de Integração (Frontend)**:
    ```sh
    pnpm test
    ```
-   **Relatório de Cobertura (Frontend)**:
    ```sh
    pnpm run test:coverage
    ```
-   **Testes Unitários (Scripts Python)**:
    ```sh
    pnpm run test:python
    ```
-   **Executar todos os testes**:
    ```sh
    pnpm run test:all
    ```

---

## 10. Deploy

A seção sobre deploy na Azure no `README.md` anterior pode ser usada como referência. Os scripts `create_azure_server.ps1` e `setup_azure_server.ps1` fornecem um ponto de partida para automatizar a criação de infraestrutura.

---

## 11. Contribuição

1.  Faça um Fork do projeto.
2.  Crie uma nova branch (`git checkout -b feature/nova-feature`).
3.  Faça commit de suas mudanças (`git commit -m 'feat: Adiciona nova feature'`).
4.  Faça push para a branch (`git push origin feature/nova-feature`).
5.  Abra um Pull Request.
