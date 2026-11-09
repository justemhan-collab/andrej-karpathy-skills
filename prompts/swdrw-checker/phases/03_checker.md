# Phase 3. 규칙 엔진 + 체크리스트 8종 — `[CLOUD]`

## 목표
설정 기반, 파일 1개 추가로 확장 가능한 규칙 엔진과 필수 규칙 8종.

## 규칙 엔진 구조
- `checker/base.py`
  - `class Rule`: `id`, `name_ko`, `category`, `default_severity`, `requires: set[str]`(필요 필드), `check(data, params) -> list[Issue]`
  - `@register` 데코레이터 → 레지스트리. `checker/rules/` 하위 모듈 자동 import
  - `requires` 필드가 "확인 불가"면 규칙을 **건너뛰고 INFO 이슈 1건**("입력 부족으로 검사 불가: …") 생성
- `config/rules.yaml` 예시 형식:
  ```yaml
  name_size_mismatch:
    enabled: true
    severity: ERROR
    params:
      pattern: '(?P<name>[A-Z ]+)\s*(?P<size>\d+(\.\d+)?)'
      tolerance_mm: 0.0
  ```
- 사용자 규칙 추가 가이드 `docs/add_rule.md` (복사해서 쓰는 템플릿 파일 `rules/_template.py` 포함)

## 필수 규칙 (각각: 판정 로직 / 필요 데이터 / 오탐 방지 / 메시지 예시를 주석에 기록)

| ID | 규칙 | 판정 요지 | 비고 |
|---|---|---|---|
| R01 `name_size_mismatch` | Part Name과 Size 불일치 | Part Name 내 숫자(예: "TUBE 40")와 Size 공칭값(45 mm) 비교 | 정규식·허용차 설정화, 단위(mm/inch/A) 처리 |
| R02 `bom_qty_mismatch` | BOM 수량 ≠ 실제 인스턴스 수 | BOM Qty vs 조립 구성 수량(경로 C 또는 swformat comptree) / 풍선 수 | 경로 A만으로 불가 시 INFO |
| R03 `missing_tolerance` | 치수 공차 미표기 | 개별 공차 없음 **AND** 일반공차 노트 없음 → ERROR, 일반공차 있음 → 검사 제외 | 참고치수 `( )`, 기본치수 □ 제외 |
| R04 `missing_material_finish` | 재질/표면처리 누락 | 타이틀블록·BOM 각각 공란 검사, 구매품(Vendor No 존재)은 Finish 제외 옵션 | |
| R05 `titleblock_sign_date` | 서명/날짜 공란·불일치 | Prepared/Checked/Approved 공란, 날짜 형식, 순서(작성 ≤ 검도 ≤ 승인), 미래 날짜 | 날짜 포맷 목록 설정화 |
| R06 `general_tolerance` | 일반공차 미적용 | 노트에 `KS B ISO 2768-m`, `ISO 2768-mK` 등 패턴 부재 | 허용 등급 목록 설정화 |
| R07 `chamfer_fillet_default` | 지시 없는 모따기/필렛 기본값 | "지시 없는 모따기 C0.5" 류 노트 부재, 또는 노트 값과 개별 C/R 치수 상충 가능성 | "가능성" → WARN |
| R08 `note_bom_conflict` | Note와 BOM 모순 | 노트의 재질·처리·수량 언급 vs BOM 값 비교 (예: 노트 "ANODIZING" vs BOM Finish "NI PLATING") | 동의어 사전 설정화 |

## 테스트
- 규칙별 **양성/음성/입력부족** 최소 3케이스 (`tests/unit/rules/test_rXX_*.py`)
- 설정에서 `enabled: false` → 실행 안 됨, `severity` 오버라이드 반영
- `_template.py` 복사로 만든 더미 규칙이 자동 등록되는지 테스트

## 완료 기준
- 8종 규칙 테스트 통과, 각 Issue에 `evidence`(판정 근거 원문) 포함
- 규칙 1개 추가 시 **수정 파일 = 새 규칙 파일 + rules.yaml** 뿐임을 테스트로 증명
