# Phase 2. 추출기 (경로 A·B·D + 병합) — `[CLOUD]` 구현 / `[WIN]` 검증

## 목표
SLDDRW·DWG·PDF에서 `DrawingData`를 만든다. COM(경로 C)은 Phase 6.

## 지시
1. `extractor/base.py`: `Extractor` 프로토콜 — `supports(path) -> bool`, `extract(path) -> PartialDrawingData`
2. `swformat_extractor.py` (경로 A)
   - Phase 0 스파이크에서 확인한 API만 사용
   - 타이틀블록: 커스텀 프로퍼티 + 노트 텍스트에서 매핑. **필드명 매핑은 `config/app.yaml`의 `titleblock_map`**(사내 프로퍼티명이 다를 수 있음)
   - BOM: 헤더명 → 표준 필드 매핑도 설정 파일로 (`"PART NAME"|"품명"` → `part_name`)
   - 치수 문자열 파서: `"Ø40 ±0.05"`, `"40 +0.1/-0"`, `"40 H7"`, `"R5"`, `"C1"`, `"40°"` → 공칭값·공차·유형 분리. 파싱 실패 시 원문 유지 + `parse_ok=False`
3. `pdf_extractor.py` (경로 B, `--pdf` 또는 동일 이름 PDF 자동 탐색)
   - 페이지별 텍스트 span + bbox 추출 → 치수·노트 문자열과 매칭해 `bbox` 채움
   - 좌표 변환: PDF pt → mm, 원점·축 방향을 `Location`에 명시
   - 중복 문자열은 동일 뷰/근접도로 후보를 좁히고, 모호하면 `bbox=None` + 경고
4. `dwg_extractor.py` (경로 D): `ezdwg` 우선, 예외 시 ODA File Converter(경로는 설정) → DXF → `ezdxf`. TEXT/MTEXT/DIMENSION/INSERT 속성 기반으로 타이틀블록·BOM 재구성(블록명·속성 태그 매핑은 설정)
5. `merge.py`: 우선순위 `com > swformat > dwg > pdf` (값), bbox는 `com > pdf`. 충돌 시 둘 다 기록하고 `INFO` 이슈 후보 생성
6. 폴더 입력: 확장자 필터, `concurrent.futures.ProcessPoolExecutor`(워커 수 설정), 파일별 예외 격리

## 테스트
- `[CLOUD]`: 익명화 JSON 픽스처로 swformat 어댑터 출력 → 모델 변환 테스트(swformat 호출부는 monkeypatch)
- 치수 문자열 파서: 파라미터화 테스트 30케이스 이상
- PDF: `PyMuPDF`로 합성 PDF 생성 후 bbox 매칭 테스트
- DWG/DXF: `ezdxf`로 합성 DXF 생성 후 추출 테스트
- `[WIN]` 사용자 확인:
  - [ ] 실도면 3종(부품도·조립도·다시트)에서 Sheet2 데이터가 도면과 일치
  - [ ] 파일당 추출 시간 기록

## 완료 기준
- 모든 필드가 값 또는 "확인 불가"로 채워지고 출처가 기록됨
- 단위 테스트 통과, `[WIN]` 체크 결과를 `docs/validation.md`에 기록
