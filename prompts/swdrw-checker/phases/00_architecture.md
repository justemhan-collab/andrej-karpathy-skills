# Phase 0. 아키텍처 확정 + 라이브러리 스파이크 — `[CLOUD]` → `[WIN]`

## 목표
코드 작성 전에 아키텍처를 확정하고, **swformat·ezdwg가 실제로 무엇을 주는지** 확인해 설계 가정을 검증한다.

## 지시

### 0-1. `[CLOUD]` 아키텍처 제안 (코드 작성 금지)
1. 마스터 프롬프트 5장의 폴더 구조를 검토하고 수정안이 있으면 근거와 함께 제시
2. 데이터 흐름도(텍스트 다이어그램): 입력 → 어댑터(A/B/C/D) → merge → DrawingData → Rule[] → Issue[] → Reporter
3. `DrawingData` 및 하위 모델 필드 초안 표 (필드명 / 타입 / 출처 경로 / 필수 여부)
   - 타이틀블록: Drawing No, Title, Type, Date, Prepared/Checked/Approved(+각 날짜), Item Code, Scale, Material, Finish
   - BOM: No, Drawing/Vendor No, Part Name, Size, Qty, Material, Remark
   - Dimension: id, 표시 문자열, 공칭값, 상·하한 공차, 공차 유형, sheet, view, bbox(nullable)
   - Note: 종류(General/Specific), 텍스트, sheet, view, bbox(nullable)
   - View/Sheet: 이름, 스케일, 용지, 참조 모델
   - `Location`: file, sheet, view, bbox(x0,y0,x1,y1, 단위 mm, 원점 정의 명시), source
4. 체크 규칙 8종 각각에 대해 **필요한 입력 필드 → 어느 추출 경로에서 얻는지 → 경로 A만으로 가능 여부** 매트릭스
5. 리스크 Top 5와 대응

### 0-2. `[CLOUD]` 라이브러리 스파이크
- `pip install git+https://github.com/KenM76/swformat` 및 `pip install ezdwg ezdxf pymupdf`
- 각 라이브러리의 공개 API를 소스에서 확인해 **실제 함수 시그니처와 반환 구조**를 표로 정리 (swformat: `api.tables.read_boms`, `api.annotations.read_annotation_text`, `api.dimensions.read_dimension_values`, `api.views.read_views`, `api.sheets.read_sheets`, `api.properties.read_properties` 등)
- 샘플 SLDDRW가 없으면 여기서 멈추고 `[WIN]` 작업 요청을 출력

### 0-3. `[WIN]` 실도면 스파이크 (사용자가 Windows에서 실행)
- `[CLOUD]`가 작성한 `tools/spike_dump.py <slddrw>` → 각 API 원시 출력을 JSON으로 저장
- 사용자 확인 항목:
  - [ ] SolidWorks 버전별(사내 사용 버전) 파일이 읽히는가
  - [ ] BOM 행·열이 도면과 일치하는가
  - [ ] 타이틀블록 값(커스텀 프로퍼티 토큰 해석 결과)이 맞는가
  - [ ] 치수 문자열에 공차가 포함되는가 / 개수가 화면과 같은가
  - [ ] 노트에서 General/Specific 구분이 가능한가

## 완료 기준
- 아키텍처·모델·규칙-경로 매트릭스 문서 `docs/architecture.md` 커밋
- 스파이크 결과 기반 **"경로 A로 충분 / B 필요 / C 필요"** 결론을 규칙별로 확정
- 사용자 승인 후 Phase 1 진입
