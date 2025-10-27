# Script para executar testes Python contornando alias do Microsoft Store
param(
    [string]$TestPath = "."
)

# Possíveis caminhos do Python
$pythonPaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311\python.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python310\python.exe",
    "C:\Python312\python.exe",
    "C:\Python311\python.exe",
    "C:\Python310\python.exe",
    "$env:LOCALAPPDATA\Microsoft\WindowsApps\python.exe",
    "python.exe"
)

$pythonFound = $false
$pythonExe = $null

foreach ($path in $pythonPaths) {
    try {
        $expandedPath = $ExecutionContext.InvokeCommand.ExpandString($path)
        if (Test-Path $expandedPath) {
            # Testar se o Python realmente funciona
            $version = & $expandedPath --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                $pythonExe = $expandedPath
                $pythonFound = $true
                Write-Host "Python encontrado em: $pythonExe"
                Write-Host "Versão: $version"
                break
            }
        }
    } catch {
        continue
    }
}

if (-not $pythonFound) {
    Write-Host "Python não encontrado. Tentando instalar via winget..."
    try {
        winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
        # Tentar novamente após instalação
        $pythonExe = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe"
        if (Test-Path $pythonExe) {
            $pythonFound = $true
            Write-Host "Python instalado com sucesso!"
        }
    } catch {
        Write-Host "Falha ao instalar Python automaticamente."
        Write-Host "Por favor, instale o Python manualmente de: https://www.python.org/downloads/"
        exit 1
    }
}

if ($pythonFound) {
    Write-Host "Executando testes Python..."
    try {
        & $pythonExe -m pytest $TestPath --cov=scripts --cov-report=term-missing --cov-report=html:htmlcov --cov-fail-under=80
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Testes Python executados com sucesso!"
        } else {
            Write-Host "Alguns testes Python falharam."
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "Erro ao executar testes Python: $_"
        exit 1
    }
} else {
    Write-Host "Python não encontrado. Testes Python serão pulados."
    exit 0
}