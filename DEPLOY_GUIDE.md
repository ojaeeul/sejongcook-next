# 세종요리제과기술학원 웹호스팅 배포 가이드

이 애플리케이션은 **Next.js** (Node.js 환경) 기반으로 제작되었습니다.
데이터 저장 기능(게시판 글쓰기/수정 등)이 정상 작동하려면 **Node.js 20.x 이상**을 지원하는 호스팅 환경이 필요합니다.

## 1. 빌드하기 (로컬 컴퓨터)

터미널에서 다음 명령어를 실행하여 배포용 파일을 생성합니다.

```bash
npm run build
```

이 작업이 완료되면 `.next/standalone` 폴더에 배포에 필요한 모든 파일이 생성됩니다.

> **참고:** `next.config.ts`에 `output: 'standalone'` 설정이 되어 있어야 합니다. (이미 적용됨)

## 2. 호스팅 서버에 업로드

배포 시 업로드해야 할 파일과 폴더는 다음과 같습니다.

1. **`.next/standalone`** 폴더 내의 **모든 내용**을 서버의 웹 루트(예: `public_html` 또는 상위 폴더)로 복사합니다.
2. **`.next/static`** 폴더를 서버의 `.next/static` 위치로 복사합니다.
   - standalone 폴더 안에는 static 파일이 포함되지 않으므로, 별도로 복사해주어야 CSS/이미지가 정상적으로 나옵니다.
   - 즉, 서버의 최종 구조는 다음과 같아야 합니다:
     ```
     / (프로젝트 루트)
       ├── .next/
       │     └── static/  (로컬 .next/static 내용을 여기에 복사)
       ├── public/        (로컬 public 폴더 내용을 여기에 복사)
       ├── server.js      (standalone 폴더에 있던 파일)
       └── node_modules/  (standalone 폴더에 있던 폴더)
     ```
3. **`data`** 폴더 (JSON 데이터 파일들이 있는 폴더)
   - 프로젝트 루트에 `data` 폴더를 통째로 업로드합니다.
   - **중요:** 서버에서 이 폴더와 내부 파일들에 대해 **쓰기 권한(Write Permission, 777 또는 755)**을 설정해야 관리자가 글을 저장/수정할 수 있습니다.

## 3. 서버 실행 (Node.js)

서버 터미널(SSH)에서 다음 명령어로 서버를 실행합니다.

```bash
node server.js
```

또는 `pm2`와 같은 프로세스 매니저를 사용하면 안정적으로 운영할 수 있습니다.

```bash
# pm2 설치 (없는 경우)
npm install -g pm2

# 서버 실행
pm2 start server.js --name "sejongcook"
```

## 4. Hostinger 배포 가이드 (필독)

사용자께서 **Hostinger**를 이용하실 경우, 다음 사항을 반드시 확인해야 합니다.

### 추천 상품: **VPS Hosting** (KVM 1 이상)
이 애플리케이션은 **데이터를 파일(file system)에 직접 저장**하는 방식을 사용하므로, **VPS 호스팅**이 가장 안정적이고 적합합니다.
- **장점:** 완벽한 Node.js 환경 제공, 파일 쓰기/수정 권한 자유로움, 데이터 영구 보존 보장.
- **설치 방법:**
  1. Hostinger VPS 구매 후 OS를 **Ubuntu 22.04** 또는 **Debian 11/12**로 선택합니다.
  2. SSH(터미널)로 접속합니다.
  3. Node.js를 설치합니다.
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
     sudo apt-get install -y nodejs
     ```
  4. 위 "2. 호스팅 서버에 업로드" 단계에 따라 파일을 업로드합니다 (FileZilla 등을 이용해 `/var/www/sejongcook` 등의 폴더에 업로드).
  5. PM2로 서버를 실행합니다.
     ```bash
     cd /var/www/sejongcook
     npm install -g pm2
     pm2 start server.js --name "sejongcook"
     pm2 save
     pm2 startup
     ```

### 차선책: **Business Web Hosting** (Node.js 지원 옵션)
VPS 관리가 어렵다면 **Business Web Hosting** 이상 등급에서 제공하는 Node.js 앱 호스팅 기능을 사용할 수 있습니다.
- **주의:** 일반적인 방법으로는 로컬 파일 쓰기(`fs.writeFile`)가 제한되거나, 배포 시마다 데이터가 초기화될 위험이 있습니다. **반드시 데이터 파일(`data/*.json`)이 영구 보존되는지 테스트가 필요합니다.**
- **설정 방법:**
  1. hPanel에서 **Websites > Manage > Node.js** 메뉴로 이동합니다.
  2. Node.js 버전을 **18.x** 또는 **20.x**로 설정합니다.
  3. **Application Mode**를 `Production`으로 설정합니다.
  4. **Application Root**에 파일들을 업로드합니다.
  5. `server.js`를 진입점(Entry file)으로 지정하고 실행합니다.

### ❌ 절대 금지: **Single / Premium Web Hosting** (PHP 전용)
가장 저렴한 일반 웹 호스팅은 **PHP만 지원**하므로, 이 Next.js 애플리케이션(Node.js 서버)을 실행할 수 없습니다. 이 경우 `npm run build` 대신 정적 내보내기(`output: 'export'`)를 해야 하는데, **글쓰기/수정/삭제 기능이 완전히 불가능**해집니다.

---
**문의사항이 있으시면 개발자에게 연락주세요.**
