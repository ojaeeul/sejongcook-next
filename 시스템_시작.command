#!/bin/bash

# ==============================================================================
# Sejong Cook - System Starter (Mac Equivalent to 시스템_시작.bat)
# ==============================================================================

# Get the directory of this script
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$BASE_DIR"

echo "======================================================"
echo "   세종요리제과기술학원 시스템 통합 시작기 (Mac OS)"
echo "======================================================"
echo ""

echo "[1/3] Next.js 웹사이트 서버 (Port 3000) 시작 중..."
osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'\" && npm run dev"'

echo "[2/3] 출석관리 파이썬 백엔드 서버 (Port 8000) 시작 중..."

echo "[3/3] 출석관리 파이썬 서버 (Port 8000) 시작 중..."
if [ -f "$BASE_DIR/Sejong/SejongAttendance/server.py" ]; then
    osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'/Sejong/SejongAttendance\" && python3 server.py"'
else
    echo "[!] Sejong/SejongAttendance/server.py 를 찾을 수 없습니다."
fi

echo ""
echo "------------------------------------------------------"
echo "모든 필수 서버 실행 명령이 전달되었습니다."
echo "새로운 터미널 창들을 확인해주세요."
echo "메인 사이트: http://localhost:3000"
echo "출석 시스템 (데이터 서버): http://localhost:8000"
echo "------------------------------------------------------"
echo ""
