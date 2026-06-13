#!/bin/bash
# Sejong Cook - System Starter for macOS/Linux

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$ROOT_DIR"

echo "======================================================"
echo "   세종요리제과기술학원 시스템 통합 시작기 (macOS/Linux)"
echo "======================================================"
echo ""
echo "[1/4] 파일 동기화 (최신 데이터 및 수정사항 반영) 중..."

# Create target directories if they don't exist
mkdir -p "Sejong/public"
mkdir -p "public/sejong"
mkdir -p "Sejong/data"

cp -f "Sejong/SejongAttendance/public/sms.html" "Sejong/public/sms.html"
cp -f "Sejong/SejongAttendance/public/sms.html" "public/sejong/sms.html"
cp -f "Sejong/SejongAttendance/public/sms_v3.js" "Sejong/public/sms_v3.js"
cp -f "Sejong/SejongAttendance/public/sms_v3.js" "public/sejong/sms_v3.js"
cp -f "Sejong/SejongAttendance/public/sheet.html" "Sejong/public/sheet.html"
cp -f "Sejong/SejongAttendance/public/sheet.html" "public/sejong/sheet.html"
cp -f "Sejong/SejongAttendance/public/ledger.js" "Sejong/public/ledger.js"
cp -f "Sejong/SejongAttendance/public/ledger.js" "public/sejong/ledger.js"
cp -f "Sejong/SejongAttendance/public/tuition_v3.js" "Sejong/public/tuition_v3.js"
cp -f "Sejong/SejongAttendance/public/tuition_v3.js" "public/sejong/tuition_v3.js"
cp -f "Sejong/SejongAttendance/public/tuition.html" "Sejong/public/tuition.html"
cp -f "Sejong/SejongAttendance/public/tuition.html" "public/sejong/tuition.html"
cp -f "Sejong/SejongAttendance/public/phonebook.html" "Sejong/public/phonebook.html"
cp -f "Sejong/SejongAttendance/public/phonebook.html" "public/sejong/phonebook.html"
cp -f "Sejong/SejongAttendance/public/phonebook.js" "Sejong/public/phonebook.js"
cp -f "Sejong/SejongAttendance/public/phonebook.js" "public/sejong/phonebook.js"

echo "[1/3] JSON 데이터 동기화 (SejongAttendance/data -> Sejong/data 백업) 중..."
cp -f Sejong/SejongAttendance/data/*.json Sejong/data/ 2>/dev/null || true
echo "    ✅ 데이터 동기화 및 백업 완료"
echo ""

echo "[2/2] Next.js 웹사이트 및 API 서버 (Port 3000) 시작 중..."
npm run dev &
NEXT_PID=$!

echo ""
echo "[완료] 브라우저 페이지 열기..."
sleep 2

# macOS (open) or Linux (xdg-open)
if command -v open > /dev/null; then
    open http://localhost:3000/sejong/ledger.html
elif command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000/sejong/ledger.html
fi

echo "------------------------------------------------------"
echo "✅ Vercel/Supabase 최적화된 로컬 서버가 실행되었습니다."
echo "통합 사이트: http://localhost:3000"
echo "종료하려면 Ctrl+C를 누르세요."
echo "------------------------------------------------------"
echo ""

# Wait for background processes
wait $NEXT_PID
