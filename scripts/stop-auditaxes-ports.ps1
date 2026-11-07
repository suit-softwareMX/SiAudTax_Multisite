$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path $PSScriptRoot -Parent
$siteRoot = Join-Path $repoRoot 'Auditaxes - Sitio'
$editorRoot = Join-Path $repoRoot 'Auditaxes - Editor'
$ports = @(4100, 4321, 4322, 4323, 5173)

function Get-AuditaxesListeners {
    Get-NetTCPConnection -State Listen | Where-Object {
        $_.LocalPort -in $ports -and $_.LocalAddress -ne '::1'
    }
}

function Get-ProcessInfo([int] $processId) {
    Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
}

$ownedProcesses = @{}
foreach ($listener in Get-AuditaxesListeners) {
    $processInfo = Get-ProcessInfo $listener.OwningProcess
    if (-not $processInfo) { continue }
    $command = [string] $processInfo.CommandLine
    $owned = $false

    if ($processInfo.Name -eq 'node.exe' -and $listener.LocalAddress -eq '127.0.0.1') {
        if ($listener.LocalPort -eq 4100) {
            try {
                $health = Invoke-RestMethod -Uri 'http://127.0.0.1:4100/api/health' -TimeoutSec 2
                $owned = $health.service -eq 'auditaxes-api'
            } catch {
                $owned = $false
            }
            if ($owned) {
                $parent = Get-ProcessInfo $processInfo.ParentProcessId
                if ($parent.Name -eq 'node.exe' -and $parent.CreationDate -le $processInfo.CreationDate -and
                    $parent.CommandLine -match '--watch\s+["'']?src[/\\]server\.js(?:["'']|\s|$)') {
                    $processInfo = $parent
                }
            }
        } elseif ($listener.LocalPort -eq 5173) {
            $owned = $command.IndexOf("$editorRoot\node_modules\", [StringComparison]::OrdinalIgnoreCase) -ge 0 -and
                $command -match '[/\\]vite(?:[/\\]|\.js)'
        } else {
            $owned = $command.IndexOf("$siteRoot\node_modules\", [StringComparison]::OrdinalIgnoreCase) -ge 0 -and
                $command -match '[/\\]vinext(?:[/\\]|\.js)'
        }
    }

    if (-not $owned) {
        throw "El puerto $($listener.LocalPort) esta ocupado por $($processInfo.Name) (PID $($processInfo.ProcessId)). Cierra ese programa antes de iniciar AUDITAXES."
    }
    $ownedProcesses[$processInfo.ProcessId] = $processInfo
}

foreach ($processInfo in $ownedProcesses.Values) {
    $current = Get-ProcessInfo $processInfo.ProcessId
    if (-not $current -or $current.CreationDate -ne $processInfo.CreationDate) { continue }
    Write-Host "Cerrando instancia anterior de AUDITAXES (PID $($processInfo.ProcessId))..."
    $taskkill = Start-Process -FilePath 'taskkill.exe' -ArgumentList "/PID $($processInfo.ProcessId) /T /F" -WindowStyle Hidden -Wait -PassThru
    if ($taskkill.ExitCode -ne 0 -and (Get-ProcessInfo $processInfo.ProcessId)) {
        throw "No se pudo cerrar el PID $($processInfo.ProcessId). Comprueba los permisos de la cuenta que inicio ese servicio."
    }
}

$deadline = (Get-Date).AddSeconds(10)
do {
    $remaining = @(Get-AuditaxesListeners)
    if (-not $remaining) { return }
    Start-Sleep -Milliseconds 250
} while ((Get-Date) -lt $deadline)

throw "No se liberaron los puertos $($remaining.LocalPort -join ', '). Comprueba si otro servicio vuelve a iniciar esos procesos."
