@echo off
setlocal
cd /d "%~dp0"

set "CODEX_RUNTIME=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies"
if exist "%CODEX_RUNTIME%\node\bin\node.exe" (
  set "PATH=%CODEX_RUNTIME%\bin\override;%CODEX_RUNTIME%\node\bin;%CODEX_RUNTIME%\bin\fallback;%PATH%"
)

where pnpm >nul 2>&1 || (
  echo No se encontro pnpm. Instala Node.js 22 o superior y pnpm.
  pause
  exit /b 1
)

set "NODE=%CODEX_RUNTIME%\node\bin\node.exe"

echo AUDITAXES Global: http://localhost:4321
echo AUDITAXES Mexico: http://localhost:4322
echo AUDITAXES Paraguay: http://localhost:4323

start "AUDITAXES Global" /b pnpm dev --host 0.0.0.0 --port 4321
if exist "%NODE%" (
  start "AUDITAXES Mexico" /b "%NODE%" scripts\local-site-server.mjs mexico 4322
  start "AUDITAXES Paraguay" /b "%NODE%" scripts\local-site-server.mjs paraguay 4323
) else (
  start "AUDITAXES Mexico" /b node scripts\local-site-server.mjs mexico 4322
  start "AUDITAXES Paraguay" /b node scripts\local-site-server.mjs paraguay 4323
)

echo.
echo Los tres sitios estan levantandose. Cierra las ventanas de sus procesos para detenerlos.
pause
