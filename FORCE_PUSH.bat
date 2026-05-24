@echo off
title Force Push to GitHub
color 0E

echo =====================================================
echo    FORCE PUSH CODE TO GITHUB (MAIN BRANCH)
echo =====================================================
echo.
echo [PERINGATAN] Proses ini akan menimpa repositori GitHub 
echo Anda dengan kode yang ada di laptop Anda saat ini.
echo.
pause

echo.
echo 1. Membatalkan rebase/pull yang gagal sebelumnya...
git rebase --abort 2>nul
git merge --abort 2>nul

echo.
echo 2. Menambahkan file ke staging...
git add .

echo.
echo 3. Mencoba melakukan Force Push ke main...
git push -f origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================
    echo    SELESAI! FORCE PUSH BERHASIL.
    echo    Vercel Anda akan memulai deployment baru dalam 
    echo    beberapa detik! Silakan cek Vercel dan GitHub Anda.
    echo =====================================================
) else (
    echo.
    echo =====================================================
    echo    [ERROR] FORCE PUSH GAGAL!
    echo    Silakan periksa koneksi internet Anda atau kredensial Git.
    echo =====================================================
)
pause
