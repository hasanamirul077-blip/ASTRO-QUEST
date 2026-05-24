@echo off
title Jalankan Solar System 3D (Referensi)
color 0A

echo =====================================================
echo   MENJALANKAN Solar-System-3D-main (Vite Server)
echo =====================================================
echo.
echo Memastikan Node.js tersedia...
set PATH=%PATH%;C:\laragon\bin\nodejs\nodejs-22

if not exist node_modules (
    echo.
    echo Menginstal dependensi npm install...
    echo Mohon tunggu sebentar...
    call C:\laragon\bin\nodejs\nodejs-22\npm.cmd install
)

echo.
echo Memulai Vite dev server di port 5173...
echo Buka browser dan akses: http://localhost:5173
echo.
echo [Tekan CTRL+C untuk menghentikan server]
echo.

C:\laragon\bin\nodejs\nodejs-22\npm.cmd run dev

pause