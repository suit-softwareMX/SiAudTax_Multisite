@echo off
setlocal
set "NODE_DIR=C:\Users\Ljjc2\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "PNPM_CMD=C:\Users\Ljjc2\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"

if not exist "%NODE_DIR%\node.exe" (
  echo No se encontro Node.js en el entorno de Codex.
  echo Instala Node.js desde https://nodejs.org/ y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist "%PNPM_CMD%" (
  echo No se encontro pnpm en el entorno de Codex.
  echo Instala Node.js y ejecuta: corepack enable
  pause
  exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0"

if not exist "node_modules" (
  echo Instalando dependencias...
  call "%PNPM_CMD%" install
  if errorlevel 1 goto :error
)

echo.
echo AUDITAXES se abrira en http://localhost:3000
echo Conserva esta ventana abierta mientras revisas el sitio.
echo.
call "%PNPM_CMD%" dev
exit /b %errorlevel%

:error
echo.
echo No fue posible instalar las dependencias.
pause
exit /b 1
