@echo off
title Solar System 3D + Ngrok
color 0B

echo =====================================================
echo    MENJALANKAN SOLAR SYSTEM DENGAN NGROK
echo =====================================================
echo.

:: Tambahkan folder sistem Windows ke PATH
set PATH=%PATH%;C:\Windows\System32;C:\Windows;C:\laragon\bin\nodejs\nodejs-22

:: Bersihkan layar
cls
echo =====================================================
echo    MENJALANKAN SOLAR SYSTEM DENGAN NGROK
echo =====================================================

:: Cek apakah ngrok.exe ada di folder ini
if exist "%~dp0ngrok.exe" (
    set NGROK_CMD="%~dp0ngrok.exe"
    echo [OK] Ditemukan: %~dp0ngrok.exe
) else (
    :: Cari path asli ngrok dari sistem
    for /f "tokens=*" %%i in ('where ngrok 2^>nul') do set NGROK_CMD="%%i"
    
    if defined NGROK_CMD (
        echo [OK] Ditemukan di sistem: %NGROK_CMD%
    ) else (
        echo [ERROR] File ngrok.exe TIDAK DITEMUKAN!
        echo -------------------------------------------------
        echo 1. Download dari https://ngrok.com/download
        echo 2. Ekstrak dan taruh file ngrok.exe di folder:
        echo    %~dp0
        echo -------------------------------------------------
        pause
        exit /b
    )
)

echo.
echo 1. Memulai Vite Server di background...
:: Kita jalankan di window baru agar user bisa melihat log Vite jika ada error port
start "Vite Server" cmd /c "C:\laragon\bin\nodejs\nodejs-22\npm.cmd run dev"

echo 2. Menunggu server siap (8 detik)...
timeout /t 8 >nul 2>nul || ping -n 9 127.0.0.1 >nul

echo 3. Membuka Tunnel Ngrok di background...
start /b "Ngrok" cmd /c "%NGROK_CMD% http 5173 --log=stdout > nul"

echo 4. Menunggu link siap (5 detik)...
timeout /t 5 >nul 2>nul || ping -n 6 127.0.0.1 >nul

echo -----------------------------------------------------
echo MENGAMBIL LINK PUBLIK ANDA...
echo -----------------------------------------------------
powershell -Command "$json = Invoke-RestMethod -Uri http://127.0.0.1:4040/api/tunnels; $url = $json.tunnels[0].public_url; if($url) { Write-Host 'BERHASIL! Bagikan link ini ke teman Anda:'; Write-Host $url -ForegroundColor Green; Write-Host '-----------------------------------------------------' } else { Write-Host 'Gagal mengambil link. Pastikan Authtoken sudah di-setting.' -ForegroundColor Red }"

echo.
echo [Tekan CTRL+C di sini jika ingin mematikan semuanya]
pause
