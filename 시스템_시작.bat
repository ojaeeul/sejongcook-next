@echo off
title Sejong Cook - System Starter
setlocal

:: Get the directory of this script
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Add portable Node.js to PATH
set "PATH=%ROOT_DIR%.node;%PATH%"

echo ======================================================
echo    세종요리제과기술학원 시스템 통합 시작기
echo ======================================================
echo.
echo [1/3] Next.js 웹사이트 서버 (Port 3000) 시작 중...
start "NEXT.JS - 3000" cmd /c "npm run dev"

echo [2/3] 출석관리 파이썬 백엔드 서버 (Port 8000) 시작 중...

echo [3/3] 출석관리 파이썬 서버 (Port 8000) 시작 중...
if exist "Sejong\SejongAttendance\server.py" (
    start "PYTHON - 8000" cmd /c "cd Sejong\SejongAttendance && py server.py"
) else (
    echo [!] Sejong\SejongAttendance\server.py 를 찾을 수 없습니다.
)

echo.
echo ------------------------------------------------------
echo 모든 필수 서버가 실행되었습니다.
echo 메인 사이트: http://localhost:3000
echo 출석 시스템 (데이터 서버): http://localhost:8000
echo ------------------------------------------------------
echo 이 창을 닫아도 서버는 계속 실행됩니다.
echo.
pause
