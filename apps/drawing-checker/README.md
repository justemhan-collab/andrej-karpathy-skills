# 도면 검토기 (HTML)

브라우저에서 도면을 열면 체크리스트 규칙으로 자동 검토하는 단일 HTML 프로그램입니다.
`prompts/swdrw-checker/`에 정리한 하이브리드 구조 중 "검사기·리포터·레드마킹"을 브라우저에서 먼저 구현한 것입니다.

## 1. 실행

- `index.html`은 아티팩트 형식(doctype·head 없음)으로 작성되어 있습니다. 로컬에서도 브라우저로 바로 열 수 있습니다.
- 라이브러리(pdf.js, pdf-lib, SheetJS, dxf-parser)와 글꼴을 CDN에서 불러오므로 인터넷 연결이 필요합니다.
- 처음 열면 예시 도면 2건(샘플, 실제 사내 도면 아님)이 자동으로 검토된 상태로 열립니다.

## 2. 입력

| 형식 | 처리 | 한계 |
|---|---|---|
| PDF | 텍스트·좌표 추출 → 타이틀블록·BOM·치수·노트·뷰 인식 | SolidWorks에서 "텍스트를 텍스트로" 내보낸 PDF만 가능 (스캔·윤곽선화 PDF 불가) |
| DXF | TEXT/MTEXT/DIMENSION 추출, 선·원 표시 | DWG는 ODA File Converter로 DXF 변환 후 사용 |
| JSON | Python 추출기(swformat/COM) 결과 `DrawingData`를 그대로 검사 | 도면 이미지 없음 |
| SLDDRW | 브라우저에서 직접 읽을 수 없음 | PDF로 내보내거나 Python 추출기 JSON 사용 |

- 파일 여러 개 선택, 폴더 일괄, 드래그 앤 드롭 지원

## 3. 검사 규칙

| ID | 규칙 | 기본 심각도 |
|---|---|---|
| R01 | Part Name 숫자 ≠ Size (예: TUBE 40 / Ø45) | 오류 |
| R02 | BOM 항목 풍선 없음 / JSON `instances` ≠ Qty | 경고 |
| R03 | 개별 공차 없음 + 일반공차 노트 없음 | 오류 |
| R04 | 타이틀블록 재질·표면처리 공란, BOM 재질 공란(구매품 제외) | 오류 |
| R05 | 서명 공란, 날짜 공란·형식 오류·미래 날짜, 결재 순서 역전 | 오류 |
| R06 | 일반공차(KS B ISO 2768 등) 노트 없음 | 오류 |
| R07 | 지시 없는 모따기·필렛 기본값 노트 없음 | 경고 |
| R08 | 노트의 표면처리·재질·수량이 타이틀블록/BOM과 다름 | 경고 |
| C01~ | 사용자 규칙 (설정 JSON `customRules`) | 설정값 |

- 하단 "검토 규칙 설정 (JSON)"에서 on/off, 심각도, 파라미터, 타이틀블록 라벨·BOM 헤더 정규식을 바꿀 수 있습니다.
- 사용자 규칙 형식: `{id, name, enabled, severity, target, check, pattern, message, action}`
  - `target`: `titleblock.<필드>` / `bom.<필드>` / `notes` / `dims` / `alltext`
  - `check`: `required`(공란 금지) / `regex`(일치해야 함) / `forbidden`(일치하면 안 됨) / `noteContains`

## 4. 출력

- Excel: `YYMMDD_HHMM_drawing-review.xlsx` — Sheet1 "오류리스트", Sheet2 "추출데이터"
- 레드마킹 PDF: 원본 PDF에 빨간 박스 + 오류 번호(Excel No와 동일), 위치 없는 지적은 좌상단 목록
- 브라우저 콘솔: 파일별 오류·경고·정보 건수 표

## 5. 알려진 한계

- 레이아웃 인식은 텍스트 위치 기반 휴리스틱입니다. 사내 도면 양식에서 라벨·헤더 인식이 틀리면 설정의 `labels`·`bomHeaders`를 고치세요.
- PDF 레드마킹은 Helvetica 표준 글꼴만 써서 한글 대신 영문 규칙명을 표기합니다.
- 회전된 페이지(/Rotate)는 박스 위치가 어긋날 수 있습니다.

## 6. Python 추출기 연동 (JSON)

- 형식 예시: `samples/drawing-data.sample.json`
- 필드: `titleblock`(서명 항목은 `{value, date}`), `bom[]`(`instances` = COM에서 얻은 실제 인스턴스 수), `dims[]`(`text`, `sheet`, `view`, 선택 `bbox`), `notes[]`(`kind`, `text`), `views[]`, `sheets[]`
- `prompts/swdrw-checker/` Phase 2·6의 Python 추출기가 이 형식으로 출력하면 HTML 검토기에서 바로 검사됨

## 7. 테스트

```bash
cd apps/drawing-checker/tests && npm install && npm test
```

- 샘플 PDF 2건(지적 건수·규칙), BOM 추출, Excel·레드마킹 저장, JSON 입력, DXF 입력, 스크립트 오류 여부를 검사 (10건)
- CDN 대신 로컬 npm 패키지로 라이브러리를 제공하므로 오프라인에서도 실행됨
