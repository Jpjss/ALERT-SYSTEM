# Testes do Sistema de Alertas

Este documento descreve como executar os testes do sistema ALERT SYSTEM.

## Estrutura dos Testes

```
tests/
├── api/                    # Testes das APIs Next.js
│   ├── alerts.test.ts     # Testes da API de alertas
│   └── status.test.ts     # Testes da API de status
├── hooks/                  # Testes dos hooks React
│   └── use-socket.test.ts # Testes do hook useSocket
├── client_monitor_test.py  # Testes do agente cliente Python
├── database_setup_test.py  # Testes dos scripts SQL
└── ...
```

## Tipos de Testes

### 1. Testes JavaScript/TypeScript (Jest)
- **APIs**: Testam os endpoints Next.js com autenticação e validação
- **Hooks**: Testam os hooks React para comunicação em tempo real
- **Integração**: Validam o fluxo completo do sistema

### 2. Testes Python (pytest)
- **Agente Cliente**: Testa o monitor de sistema Python
- **Scripts SQL**: Valida a estrutura e dados do banco
- **Integração**: Testa operações do banco de dados

## Como Executar os Testes

### Pré-requisitos

1. **Instalar dependências JavaScript**:
   ```bash
   pnpm install
   ```

2. **Instalar dependências Python**:
   ```bash
   cd scripts
   pip install -r requirements.txt
   cd ..
   ```

### Executar Todos os Testes

```bash
# Executar todos os testes (JS + Python)
npm run test:all
```

### Executar Testes Separadamente

#### Testes JavaScript/TypeScript
```bash
# Executar todos os testes Jest
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage
```

#### Testes Python
```bash
# Executar todos os testes Python
npm run test:python

# Ou diretamente com pytest
python -m pytest tests/ -v
```

### Executar Testes Específicos

#### Testes de API
```bash
# Testes da API de status
npx jest tests/api/status.test.ts

# Testes da API de alertas
npx jest tests/api/alerts.test.ts
```

#### Testes de Hooks
```bash
# Testes do hook useSocket
npx jest tests/hooks/use-socket.test.ts
```

#### Testes Python
```bash
# Testes do agente cliente
python -m pytest tests/client_monitor_test.py -v

# Testes do banco de dados
python -m pytest tests/database_setup_test.py -v
```

## Configuração dos Testes

### Jest (JavaScript/TypeScript)
- **Framework**: Jest com ts-jest
- **Ambiente**: Node.js
- **Cobertura**: Configurada para `app/` e `lib/`
- **Setup**: `tests/setup.ts` com mocks globais

### Pytest (Python)
- **Framework**: pytest
- **Configuração**: `pytest.ini`
- **Marcadores**: `unit`, `integration`, `slow`, `database`

## Mocks e Configuração

### Mocks JavaScript
- **Banco de dados**: Mock completo das operações PostgreSQL
- **Socket.IO**: Mock das conexões e eventos
- **Next.js**: Mock das requisições e respostas

### Mocks Python
- **psycopg2**: Mock das conexões e operações SQL
- **requests**: Mock das chamadas HTTP
- **psutil**: Mock das métricas do sistema

## Cobertura de Testes

Os testes cobrem:

### Funcionalidades Principais
- ✅ Monitoramento de status dos clientes
- ✅ Criação e gerenciamento de alertas
- ✅ Comunicação em tempo real via Socket.IO
- ✅ Autenticação e autorização
- ✅ Validação de dados
- ✅ Tratamento de erros

### Cenários de Teste
- ✅ Operação normal do sistema
- ✅ Condições de erro e falha
- ✅ Dados inválidos e edge cases
- ✅ Conectividade de rede
- ✅ Performance e limites

## Relatórios de Cobertura

Para gerar relatório de cobertura:

```bash
# JavaScript/TypeScript
npm run test:coverage

# Python
python -m pytest tests/ --cov=scripts --cov-report=html
```

## CI/CD

Os testes podem ser executados em pipeline de CI/CD:

```yaml
# Exemplo GitHub Actions
- name: Run Tests
  run: |
    npm run test:all
```

## Debugging

### Testes Falhando

1. **Verificar dependências**: Assegure que todas as dependências estão instaladas
2. **Verificar configuração**: Confirme que variáveis de ambiente estão corretas
3. **Executar individualmente**: Rode testes específicos para isolar problemas
4. **Verificar logs**: Use `--verbose` para mais detalhes

### Problemas Comuns

- **Portas ocupadas**: Certifique-se que portas 3000 e 3001 estão livres
- **Banco não disponível**: Testes mockam o banco, mas integração pode falhar
- **Dependências Python**: Instale com `pip install -r scripts/requirements.txt`

## Manutenção dos Testes

### Adicionando Novos Testes

1. **JavaScript**: Crie arquivos `.test.ts` na pasta apropriada
2. **Python**: Crie arquivos `_test.py` seguindo convenções pytest
3. **Mantenha mocks**: Atualize mocks quando APIs mudarem

### Boas Práticas

- Use mocks para dependências externas
- Teste casos de erro e edge cases
- Mantenha testes independentes
- Use nomes descritivos para testes
- Documente cenários complexos