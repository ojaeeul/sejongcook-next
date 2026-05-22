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

echo "⚠️  [정책] 모든 파일 수정은 반드시 아래 한 곳에서만 하세요:"
echo "    📁 $BASE_DIR/Sejong/SejongAttendance/public/"
echo "   (이 폴더가 정본입니다. 다른 곳을 수정하면 다음 저장 시 덮어씌워집니다)"
echo ""

echo "[1/3] JSON 데이터 동기화 (SejongAttendance/data → Sejong/data 백업) 중..."
cp "$BASE_DIR/Sejong/SejongAttendance/data/"*.json "$BASE_DIR/Sejong/data/" 2>/dev/null || true
echo "    ✅ 데이터 동기화 및 백업 완료"
echo ""

echo "[2/3] Next.js 웹사이트 서버 (Port 3000) 시작 중..."
osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'\" && npm run dev"'

echo "[3/3] 출석관리 파이썬 서버 (Port 8000) 시작 중..."
if [ -f "$BASE_DIR/Sejong/SejongAttendance/server.py" ]; then
    osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'/Sejong/SejongAttendance\" && python3 server.py"'
else
    echo "[!] Sejong/SejongAttendance/server.py 를 찾을 수 없습니다."
fi

echo ""
echo "[브라우저 열기] 서버 준비 대기 중..."
sleep 3
open "http://localhost:8000/ledger.html"
open "http://localhost:8000/index.html"
open "http://localhost:3000"

echo "------------------------------------------------------"
echo "✅ 모든 서버 실행 명령이 전달되었습니다."
echo "   새로운 터미널 창들을 확인해주세요."
echo ""
echo "  📌 정본 파일 위치 (항상 여기서만 수정하세요):"
echo "     $BASE_DIR/Sejong/SejongAttendance/public/"
echo ""
echo "  🌐 메인 사이트:        http://localhost:3000"
echo "  🌐 출석/납부 시스템:   http://localhost:8000"
echo "------------------------------------------------------"
echo ""
