@echo off
REM ========================================
REM Script de instalação do Monitor no Servidor do Cliente (Windows)
REM ========================================

echo ========================================
echo   Instalador do Monitor de Status
echo   Sistema de Alertas
echo ========================================
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale Python 3.8+ de: https://www.python.org/downloads/
    echo Marque a opcao "Add Python to PATH" durante a instalacao
    pause
    exit /b 1
)

echo [OK] Python encontrado
python --version

REM Define diretório de instalação
set INSTALL_DIR=%ProgramFiles%\AlertMonitor
echo.
echo Diretorio de instalacao: %INSTALL_DIR%
echo.

REM Cria diretório
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copia arquivos
echo Copiando arquivos...
copy client_monitor.py "%INSTALL_DIR%\"
copy requirements_client.txt "%INSTALL_DIR%\requirements.txt"

REM Cria ambiente virtual
echo.
echo Criando ambiente virtual Python...
cd /d "%INSTALL_DIR%"
python -m venv venv

REM Ativa ambiente virtual e instala dependências
echo.
echo Instalando dependencias...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Solicita configurações
echo.
echo ========================================
echo   Configuracao do Cliente
echo ========================================
echo.

set /p CLIENT_ID="ID do Cliente (ex: CLI001): "
set /p CLIENT_NAME="Nome do Cliente: "
set /p API_URL="URL da API (ex: https://alerts.empresa.com): "
set /p API_TOKEN="Token da API: "
set /p CHECK_INTERVAL="Intervalo em segundos (padrao: 120): "
if "%CHECK_INTERVAL%"=="" set CHECK_INTERVAL=120

REM Cria arquivo .env
echo.
echo Criando arquivo de configuracao...
(
echo CLIENT_ID=%CLIENT_ID%
echo CLIENT_NAME=%CLIENT_NAME%
echo API_URL=%API_URL%
echo API_TOKEN=%API_TOKEN%
echo CHECK_INTERVAL=%CHECK_INTERVAL%
) > "%INSTALL_DIR%\.env"

echo.
echo ========================================
echo   Configurando Servico do Windows
echo ========================================
echo.

REM Cria arquivo batch para executar o monitor
(
echo @echo off
echo cd /d "%INSTALL_DIR%"
echo call venv\Scripts\activate.bat
echo python client_monitor.py
) > "%INSTALL_DIR%\run_monitor.bat"

REM Cria tarefa agendada para iniciar com o Windows
echo Criando tarefa agendada...
schtasks /create /tn "AlertMonitor" /tr "%INSTALL_DIR%\run_monitor.bat" /sc onstart /ru SYSTEM /f

echo.
echo ========================================
echo   Instalacao Concluida!
echo ========================================
echo.
echo Cliente: %CLIENT_NAME% (%CLIENT_ID%)
echo Diretorio: %INSTALL_DIR%
echo.
echo O monitor foi configurado para iniciar automaticamente com o Windows.
echo.
echo Para iniciar agora, execute:
echo   cd "%INSTALL_DIR%"
echo   run_monitor.bat
echo.
echo Comandos uteis:
echo   - Iniciar tarefa:  schtasks /run /tn "AlertMonitor"
echo   - Parar tarefa:    taskkill /f /im python.exe
echo   - Ver tarefa:      schtasks /query /tn "AlertMonitor"
echo   - Remover tarefa:  schtasks /delete /tn "AlertMonitor" /f
echo.
pause
