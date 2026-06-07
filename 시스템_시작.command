#!/bin/bash

# ==============================================================================
# Sejong Cook - System Starter (Mac Equivalent to 시스템_시작.bat)
# ==============================================================================

# Get the directory of this script
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# sejongcook-next 기준이므로, 상위 폴더(sejk 4) 경로도 계산
ROOT_DIR="$( cd "$BASE_DIR/.." && pwd )"
cd "$BASE_DIR"

# ==============================================================================
# 경로 고정 (절대 변경하지 마세요)
# ==============================================================================
SRC_DIR="$BASE_DIR/Sejong/SejongAttendance/public"   # ✅ 정본 (항상 여기서만 수정)
DST1_DIR="$BASE_DIR/Sejong/public"                   # Python 서버(8000) 서비스 폴더
DST2_DIR="$ROOT_DIR/sejongcook_final_deploy/sejong"  # 배포용 폴더
DST3_DIR="$BASE_DIR/public/sejong"                   # Next.js (Port 3000) 서비스 폴더

echo "======================================================"
echo "   세종요리제과기술학원 시스템 통합 시작기 (Mac OS)"
echo "======================================================"
echo ""
echo "⚠️  [정책] 모든 파일 수정은 반드시 아래 한 곳에서만 하세요:"
echo "    📁 $SRC_DIR"
echo "   (시스템 시작 시 자동으로 모든 서비스 폴더에 복사됩니다)"
echo ""

# ==============================================================================
# [STEP 0] 정본 보호 동기화 (data/ 폴더 제외 - JSON은 별도 동기화)
# 정본 → Sejong/public (Python 서버용)
# 정본 → sejongcook_final_deploy/sejong (배포용)
# ==============================================================================
echo "[0/4] 📋 정본 파일 보호 동기화 중..."
echo ""

sync_dir() {
    local src="$1"
    local dst="$2"
    local label="$3"
    echo "      → $label"
    rsync -a --exclude='data/' --exclude='*.bak' --exclude='*.orig' \
        --exclude='*.rej' --exclude='.DS_Store' \
        "$src/" "$dst/" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "        ✅ 완료"
    else
        # rsync 실패 시 cp로 대체
        find "$src" -maxdepth 1 -type f \
            ! -name '*.bak' ! -name '*.orig' ! -name '*.rej' ! -name '.DS_Store' \
            | while read f; do
            cp "$f" "$dst/" 2>/dev/null
        done
        echo "        ✅ 완료 (cp 방식)"
    fi
}

sync_dir "$SRC_DIR" "$DST1_DIR"  "Sejong/public (Python 서버용)"
sync_dir "$SRC_DIR" "$DST2_DIR"  "sejongcook_final_deploy/sejong (배포용)"
sync_dir "$SRC_DIR" "$DST3_DIR"  "public/sejong (Next.js 웹서버용)"

echo ""
echo "    ✅ 정본 동기화 완료 — 부팅 후에도 수정 내용이 보존됩니다."
echo ""

# ==============================================================================
# [STEP 1] JSON 데이터 동기화
# ==============================================================================
echo "[1/4] JSON 데이터 동기화 중..."
cp "$SRC_DIR/data/"*.json "$DST1_DIR/data/" 2>/dev/null || true
cp "$SRC_DIR/data/"*.json "$DST2_DIR/data/" 2>/dev/null || true
cp "$SRC_DIR/data/"*.json "$DST3_DIR/data/" 2>/dev/null || true
echo "    ✅ JSON 데이터 동기화 완료"
echo ""

# ==============================================================================
# [STEP 2] Next.js 웹사이트 서버 (Port 3000)
# ==============================================================================
echo "[2/4] Next.js 웹사이트 서버 (Port 3000) 시작 중..."
osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'\" && npm run dev"'
echo "    ✅ Next.js 서버 시작 명령 전달"
echo ""

# ==============================================================================
# [STEP 3] Python 출석관리 서버 (Port 8000)
# ==============================================================================
echo "[3/4] 출석관리 파이썬 서버 (Port 8000) 시작 중..."
if [ -f "$BASE_DIR/Sejong/SejongAttendance/server.py" ]; then
    osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'/Sejong/SejongAttendance\" && python3 server.py"'
    echo "    ✅ Python 서버 시작 명령 전달"
else
    echo "    [!] Sejong/SejongAttendance/server.py 를 찾을 수 없습니다."
fi
echo ""

# ==============================================================================
# [STEP 4] 브라우저 열기
# ==============================================================================
echo "[4/4] 브라우저 열기 (서버 준비 대기 3초)..."
sleep 3
open "http://localhost:3000/sejong/ledger.html"
open "http://localhost:3000/sejong/index.html"
open "http://localhost:3000"

echo ""
echo "======================================================"
echo "✅ 시스템 시작 완료!"
echo ""
echo "  📌 정본 파일 위치 (항상 여기서만 수정):"
echo "     $SRC_DIR"
echo ""
echo "  🔄 동기화된 폴더:"
echo "     $DST1_DIR"
echo "     $DST2_DIR"
echo "     $DST3_DIR"
echo ""
echo "  🌐 메인 사이트:        http://localhost:3000"
echo "  🌐 출석/납부 시스템:   http://localhost:3000/sejong"
echo "======================================================"
echo ""
