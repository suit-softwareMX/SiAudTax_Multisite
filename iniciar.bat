@echo off
setlocal
cd /d "%~dp0"

rem Usa el runtime de Codex cuando exista; en el servidor usa Node y pnpm globales.
set "CODEX_RUNTIME=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies"
if exist "%CODEX_RUNTIME%\node\bin\node.exe" (
  set "PATH=%CODEX_RUNTIME%\bin\override;%CODEX_RUNTIME%\node\bin;%CODEX_RUNTIME%\bin\fallback;%PATH%"
)

where node >nul 2>&1 || (
  echo No se encontro Node.js. Instala Node.js 22 o superior.
  pause
  exit /b 1
)

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" || (
  echo AUDITAXES requiere Node.js 22 o superior.
  node --version
  pause
  exit /b 1
)

where pnpm >nul 2>&1 || (
  echo No se encontro pnpm. Instalalo con: corepack enable
  pause
  exit /b 1
)

if not defined AUDITAXES_HOST set "AUDITAXES_HOST=0.0.0.0"

if not exist "node_modules" (
  echo Instalando dependencias...
  call pnpm install --frozen-lockfile
  if errorlevel 1 goto :error
)

echo Construyendo AUDITAXES para produccion...
call pnpm build
if errorlevel 1 goto :error

echo.
echo Iniciando los tres dominios de AUDITAXES:
echo   auditaxes.suitmx.com            -^> http://localhost:4321
echo   mexico-auditaxes.suitmx.com     -^> http://localhost:4322
echo   elsalvador-auditaxes.suitmx.com -^> http://localhost:4323
echo.
start "AUDITAXES Global" /b cmd /c "call pnpm exec vinext start --hostname %AUDITAXES_HOST% --port 4321"
start "AUDITAXES Mexico" /b cmd /c "call pnpm exec vinext start --hostname %AUDITAXES_HOST% --port 4322"
start "AUDITAXES El Salvador" /b cmd /c "call pnpm exec vinext start --hostname %AUDITAXES_HOST% --port 4323"

echo Los tres sitios estan levantandose. Conserva esta ventana abierta.
pause
exit /b 0

:error
echo.
echo No fue posible levantar AUDITAXES. Revisa los mensajes anteriores.
pause
exit /b 1
