@echo off
rem ============================================
rem  Rapikan struktur folder RAPI.APP
rem  Double-click file ini SEKALI, lalu selesai.
rem ============================================
cd /d "%~dp0"

echo Membuat folder...
if not exist "docs" mkdir "docs"
if not exist "design" mkdir "design"
if not exist "design\marketing" mkdir "design\marketing"

echo Memindahkan file design...
if exist "Rapi_UI_Kit_Dashboard.html" move /Y "Rapi_UI_Kit_Dashboard.html" "design\ui-kit-dashboard.html"
if exist "Rapi_UserFlow_Wireframe.html" move /Y "Rapi_UserFlow_Wireframe.html" "design\userflow-wireframe.html"

echo Memindahkan aset Instagram...
if exist "Instagram post - 1.png" move /Y "Instagram post - 1.png" "design\marketing\instagram-post-1.png"
if exist "Instagram post - 2.png" move /Y "Instagram post - 2.png" "design\marketing\instagram-post-2.png"
if exist "Instagram post - 3.png" move /Y "Instagram post - 3.png" "design\marketing\instagram-post-3.png"
if exist "Instagram post - 4.png" move /Y "Instagram post - 4.png" "design\marketing\instagram-post-4.png"

echo Menghapus file lama yang sudah digantikan CLAUDE.md...
if exist "Rapi_Master_Prompt_CLAUDE.md" del "Rapi_Master_Prompt_CLAUDE.md"

echo.
echo ============================================
echo  Selesai! Folder RAPI.APP sudah rapi.
echo  Script ini boleh dihapus setelah dijalankan.
echo ============================================
pause
