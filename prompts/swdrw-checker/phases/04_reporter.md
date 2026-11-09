# Phase 4. 리포터 (Excel · 콘솔 · 마크 JSON) — `[CLOUD]`

## 지시
1. `reporter/excel.py` — 파일명 `YYMMDD_HHMMSS_도면검토결과.xlsx`
   - **Sheet1 "오류리스트"**: No, 파일명, 시트, 뷰, 위치(bbox), 문제 유형, 상세 내용, 심각도, 권장 조치, 근거, 규칙 ID
     - 심각도별 셀 색(ERROR 빨강 / WARN 주황 / INFO 회색), 자동 필터, 틀 고정, 열 너비 자동
   - **Sheet2 "추출데이터"**: 구역별(타이틀블록 / BOM / 치수 / 노트 / 뷰·시트) 표, 각 값의 출처 열 포함
     - 데이터가 많으면 Sheet2를 `BOM`, `치수`, `노트`로 분할하는 옵션(`app.yaml`)
   - (선택) **"요약"** 시트: 파일별·규칙별 건수 피벗
2. `reporter/console.py`: 파일별 한 줄 + 최종 표 (ERROR/WARN/INFO 건수, 실패 파일 목록, 소요 시간)
3. `reporter/marks.py`: `issues_marks.json` — `[{no, file, page, bbox_mm, bbox_pt, rule_id, severity, message}]` (GUI·외부 뷰어 재사용용)
4. 대량 출력 성능: openpyxl `write_only` 모드 또는 pandas 일괄 쓰기 중 측정 후 선택

## 테스트
- 생성된 xlsx를 openpyxl로 다시 열어 시트명·헤더·행 수·서식 검증
- 이슈 0건, 10,000건 케이스
- 한글 파일명·경로 처리

## 완료 기준
- `python -m swdrw_checker check tests/fixtures -o out/` → xlsx + json + 콘솔 요약 생성
