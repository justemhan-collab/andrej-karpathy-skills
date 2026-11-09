# Phase 1. 스캐폴드 · 데이터 모델 · 설정 · 로깅 · CLI 골격 — `[CLOUD]`

## 목표
추출·검사 로직 없이도 `check` 명령이 끝까지 돌아가는 뼈대를 만든다.

## 지시
1. `pyproject.toml` (패키지 `swdrw_checker`, src 레이아웃, extras: `dwg`, `pdf`, `win`, `dev`)
2. `models.py`: Phase 0에서 확정한 모델. 모든 값 필드는 `None` 허용 + `source` 필드. `Issue`는
   `no, file, location, rule_id, category, message, detail, severity(ERROR/WARN/INFO), recommendation, evidence`
3. `config/app.yaml`, `config/rules.yaml` + 로더(스키마 검증, 누락 키 기본값, 잘못된 값은 한국어 오류로 즉시 종료)
4. `logging_setup.py`: 콘솔(한국어, INFO) + 파일(`logs/YYMMDD_HHMMSS.log`, DEBUG)
5. `messages_ko.py`: 사용자 노출 문자열 집중
6. `main.py` / `__main__.py`: `check <경로> [-o 출력폴더] [--config] [--pdf] [--redmark] [--com] [-v]`
7. `pipeline.run(paths, config) -> RunResult` — 지금은 빈 추출기·빈 규칙으로 동작
8. 테스트: 모델 생성, 설정 로딩(정상/누락/오류), CLI가 빈 폴더·없는 경로에서 한국어 메시지로 종료코드 반환

## 종료 코드 규약
`0` 오류 없음 / `1` 검토 오류 발견 / `2` 실행 실패(설정·입력 오류)

## 완료 기준
- `python -m swdrw_checker check tests/fixtures` 실행 시 "검토 파일 0건" 류 요약 출력
- `pytest tests/unit -q` 전부 통과
