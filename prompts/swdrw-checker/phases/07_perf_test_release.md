# Phase 7. 성능 · 통합 테스트 · 배포 · GUI 확장점 — `[CLOUD]` + `[WIN]`

## 지시
1. 성능 (목표: 파일당 수 초 이내, 수치 목표는 Phase 2 `[WIN]` 측정값 기준으로 확정 — 확인 필요)
   - 단계별 소요 시간 로그(추출/검사/보고), `--profile` 옵션으로 cProfile 출력
   - 병목 개선은 측정 근거와 함께만 수행
   - 일괄 처리: 프로세스 풀, 결과 스트리밍 쓰기
2. 통합 테스트
   - `tests/integration/`: 픽스처 폴더 → xlsx·json·redmark.pdf 생성까지 end-to-end
   - 회귀 스냅샷: 규칙 결과 JSON을 골든 파일과 비교
3. 배포
   - `README.md`(한국어): 설치(swformat git 설치 포함), 실행 예, 설정 설명, 규칙 추가 방법, 알려진 한계
   - `[WIN]` 배포용 실행 파일(PyInstaller) 빌드 스크립트 — 필요 시
4. GUI 확장점 (구현은 하지 않음)
   - `pipeline.run()`에 진행률 콜백(`on_progress(file, step, pct)`) 추가
   - GUI 후보(예: PySide6, 웹 UI) 비교 표만 문서화

## 완료 기준
- `pytest -q` (Linux) 전부 통과, `pytest -m win` (Windows) 결과 기록
- 실도면 10건 이상 일괄 처리 결과와 소요 시간을 `docs/validation.md`에 기록
- 알려진 한계·확인 필요 목록 최신화
