#!/bin/bash

# ==============================================================================
# Sejong Cook - System Starter (Mac Equivalent to 시스템_시작.bat)
# ==============================================================================

# 현재 실행 중인 터미널 창의 ID 저장 (나중에 스스로 닫기 위함)
MY_WINDOW_ID=$(osascript -e 'tell application "Terminal" to id of front window' 2>/dev/null)

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
# ==============================================================================
# [STEP 0-A] 버전 번호 계산 및 HTML 파일 자동 업데이트
# ==============================================================================
TODAY=$(date '+%Y%m%d')
VERSION_FILE="$BASE_DIR/.backup_version"
VERSION_NUM=0

if [ -f "$VERSION_FILE" ]; then
    LAST_DATE=$(cut -d'-' -f1 "$VERSION_FILE")
    LAST_NUM=$(cut -d'-' -f2 "$VERSION_FILE")
    
    if [ "$LAST_DATE" == "$TODAY" ]; then
        VERSION_NUM=$((LAST_NUM + 1))
    fi
fi
NEW_VERSION="${TODAY}-${VERSION_NUM}"
echo "$NEW_VERSION" > "$VERSION_FILE"

echo "[*] 새로운 버전($NEW_VERSION)을 HTML 파일들에 자동으로 일괄 적용합니다..."
find "$SRC_DIR" -name "*.html" -type f -exec sed -i '' -E "s/(\.js|\.css)\?v=[a-zA-Z0-9_-]+/\1?v=$NEW_VERSION/g" {} +
echo "    ✅ HTML 버전 자동 업데이트 완료"
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
# [STEP 2] 이전 서버 종료 및 창 정리
# ==============================================================================
echo "[2/4] 이전 서버 및 터미널 창 정리 중..."

# Port 3000을 사용 중인 프로세스 종료 (기존 서버 끄기)
PORT_PID=$(lsof -ti :3000)
if [ ! -z "$PORT_PID" ]; then
    kill -9 $PORT_PID
    echo "    ✅ 기존 Next.js 서버(Port 3000) 종료 완료"
fi

osascript -e '
try
    tell application "Google Chrome"
        repeat with w in windows
            set t_count to count of tabs of w
            repeat with i from t_count to 1 by -1
                set t to tab i of w
                set u to URL of t
                if u starts with "http://localhost:3000" or u starts with "http://127.0.0.1" then close t
            end repeat
        end repeat
    end tell
end try
try
    tell application "Safari"
        repeat with w in windows
            set t_count to count of tabs of w
            repeat with i from t_count to 1 by -1
                set t to tab i of w
                set u to URL of t
                if u starts with "http://localhost:3000" or u starts with "http://127.0.0.1" then close t
            end repeat
        end repeat
    end tell
end try
' 2>/dev/null
echo "    ✅ 이전 인터넷 창 정리 완료"

# 열려있는 다른 터미널 창들 닫기 (현재 창 제외)
osascript -e "tell application \"Terminal\"
    set windowList to windows
    repeat with w in windowList
        try
            if id of w is not ${MY_WINDOW_ID:-0} then
                close w
            end if
        end try
    end repeat
end tell" 2>/dev/null

echo "    ✅ 이전 터미널 창 정리 완료"
echo ""

# ==============================================================================
# [STEP 3] Next.js 웹사이트 서버 시작 및 브라우저 열기
# ==============================================================================
echo "[3/4] 새로운 터미널을 띄워 Next.js 서버를 시작합니다..."
osascript -e 'tell app "Terminal" to do script "cd \"'"$BASE_DIR"'\" && npm run dev"'
echo "    ✅ Next.js 서버 시작 완료"
echo ""

echo "서버 준비 대기 (5초)..."
sleep 5

echo "✅ 서버가 실행되었습니다. 기존 브라우저 창에서 새로고침(F5)을 눌러주세요!"

# ==============================================================================
# [STEP 4] 깃허브(Git) 자동 백업 저장
# ==============================================================================
echo ""
echo "[4/5] 전체 소스코드 변경사항을 깃허브(Git)에 자동 저장합니다..."
VERSION_FILE="$BASE_DIR/.backup_version"
NEW_VERSION=$(cat "$VERSION_FILE")

git add .
git commit -m "Auto backup: $NEW_VERSION"
git push
echo "    ✅ Git 백업 완료"
echo ""

# ==============================================================================
# [STEP 5] Vercel 실서버 자동 배포 (Background)
# ==============================================================================
echo ""
echo "[5/5] Vercel 실서버 자동 업로드(배포)를 백그라운드에서 진행합니다..."
nohup npx vercel --prod --yes > vercel_deploy.log 2>&1 &
echo "    ✅ 실서버 배포 명령 전달 (백그라운드에서 조용히 진행됩니다)"
echo ""

echo "======================================================"
echo "✅ 시스템 시작 및 실서버 배포 준비 완료!"
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
echo "  🌐 Vercel 실서버:      https://sejongcook.co.kr"
echo "======================================================"
echo ""

# 완료 메시지를 맥OS 팝업 창으로 띄우기 (버전 표시)
osascript -e 'tell app "System Events" to display dialog "✅ 시스템 동기화, 백업 및 실행이 완료되었습니다!\n\n현재 배포된 버전: '"$NEW_VERSION"'" buttons {"확인"} default button "확인" with title "세종요리제과학원 시스템 시작"'

# 명령어 실행 창 스스로 닫기 (이 터미널 창)
if [ ! -z "$MY_WINDOW_ID" ]; then
    osascript -e "tell application \"Terminal\" to close window id $MY_WINDOW_ID" &
fi
exit 0
