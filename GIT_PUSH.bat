@echo off
title Git Push to GitHub
color 0E

echo =====================================================
echo    PUSH CODE TO GITHUB (MAIN BRANCH)
echo =====================================================
echo.

:: Cek apakah sudah ada folder .git
if not exist ".git" (
    echo [INFO] Inisialisasi Git baru...
    git init
    git branch -M main
    git remote add origin https://github.com/hasanamirul077-blip/ASTRO-QUEST
) else (
    echo [INFO] Mengatur ulang Remote URL dan Branch...
    git remote set-url origin https://github.com/hasanamirul077-blip/ASTRO-QUEST
    git branch -M main
)

echo.
echo 1. Menambahkan file ke staging...
git add .

echo 2. Melakukan commit...
set /p commit_msg="Masukkan pesan commit (kosongkan untuk 'Fresh Start'): "
if "%commit_msg%"=="" set "commit_msg=Fresh Start"
git commit -m "%commit_msg%"

echo.
echo 3. Melakukan Sinkronisasi dengan GitHub (Pull)...
echo Menarik perubahan terbaru dari remote untuk mencegah konflik...
git pull origin main --rebase

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [PERINGATAN] Gagal melakukan pull biasa / rebase.
    echo Mencoba menggunakan penggabungan riwayat yang tidak terkait ^(unrelated histories^)...
    git pull origin main --allow-unrelated-histories --no-edit
)

echo.
echo 4. Melakukan Push ke main...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================
    echo    SELESAI! PUSH BERHASIL SINKRON DENGAN GITHUB.
    echo    Vercel Anda akan memulai deployment otomatis sekarang!
    echo    Silakan pantau dashboard Vercel Anda.
    echo =====================================================
) else (
    echo.
    echo =====================================================
    echo    [ERROR] PROSES PUSH GAGAL!
    echo    Silakan periksa koneksi internet Anda atau pastikan tidak
    echo    ada konflik file yang perlu diselesaikan manual.
    echo =====================================================
)
pause
