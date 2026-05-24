@echo off
title Git Push to GitHub
color 0E

echo =====================================================
echo    PUSH CODE TO GITHUB (MAIN BRANCH)
echo =====================================================
echo.

:: Hapus folder .git lama jika ingin benar-benar fresh (Opsional)
:: if exist ".git" rd /s /q ".git"

:: Cek apakah sudah ada folder .git
if not exist ".git" (
    echo [INFO] Inisialisasi Git baru...
    git init
    git branch -M main
    git remote add origin https://github.com/hasanamirul/Solar-System.git
) else (
    echo [INFO] Mengatur ulang Remote URL dan Branch...
    git remote set-url origin https://github.com/hasanamirul/Solar-System.git
    git branch -M main
)

echo.
echo 1. Menambahkan file ke staging...
git add .

echo 2. Melakukan commit...
set /p commit_msg="Masukkan pesan commit (kosongkan untuk 'Fresh Start'): "
if "%commit_msg%"=="" set commit_msg="Fresh Start"
git commit -m "%commit_msg%"

echo 3. Melakukan Push ke main 
git push -u origin main 

echo.
echo =====================================================
echo    SELESAI! SILAKAN CEK GITHUB ANDA.
echo =====================================================
pause
