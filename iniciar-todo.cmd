@echo off
title AUDITAXES - Entorno local
cd /d "%~dp0"
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
