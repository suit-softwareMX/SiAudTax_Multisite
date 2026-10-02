@echo off
title AUDITAXES - Entorno local
cd /d "%~dp0"
set "AUDITAXES_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
if exist "%AUDITAXES_NODE%\node.exe" set "PATH=%AUDITAXES_NODE%;%PATH%"
set "AUDITAXES_PNPM=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback"
if exist "%AUDITAXES_PNPM%\pnpm.cmd" set "PATH=%AUDITAXES_PNPM%;%PATH%"
where pnpm >nul 2>nul
if errorlevel 1 (
  echo No se encontro pnpm. Instala Node.js y ejecuta: npm install -g pnpm
  pause
  exit /b 1
)
call pnpm dev
set "AUDITAXES_EXIT=%errorlevel%"
echo.
if not "%AUDITAXES_EXIT%"=="0" (
  echo No fue posible mantener todos los servicios activos.
  echo Revisa los mensajes anteriores para identificar el servicio que fallo.
) else (
  echo Los servicios de AUDITAXES se detuvieron correctamente.
)
echo.
pause
exit /b %AUDITAXES_EXIT%
