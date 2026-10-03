$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not $env:INFERENCE_API_KEY) {
    $secret = Read-Host 'Clave de inferencia de AUDITAXES' -AsSecureString
    if ($secret.Length -lt 24) { throw 'La clave debe tener al menos 24 caracteres.' }
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
    try { $env:INFERENCE_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

$env:INFERENCE_URL = 'http://192.168.0.107:4110'
& pnpm.cmd dev
exit $LASTEXITCODE
