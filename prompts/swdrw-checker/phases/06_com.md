# Phase 6. SolidWorks COM 추출 · 하이라이트 — `[WIN]` 전용

> 이 단계는 **SolidWorks가 설치된 Windows PC의 로컬 Claude Code**에서 실행한다.
> `[CLOUD]`에서는 인터페이스·가드·Mock 테스트까지만 작성 가능.

## 목표
swformat로 얻지 못하는 **공차·좌표·인스턴스 수**를 COM으로 보완하고, 오류 위치를 SolidWorks 화면에서 하이라이트.

## 지시
1. 공통
   - `pywin32` import는 함수 내부 또는 `try/except ImportError` 가드. `sys.platform != "win32"`면 `ComUnavailable` 예외 → 파이프라인은 경고 후 계속
   - SolidWorks 연결: 기존 실행 인스턴스 우선(`GetActiveObject`), 없으면 실행(옵션), 종료 시 본인이 띄운 경우만 종료
   - 문서는 **읽기 전용**으로 열기, 원본 파일 저장 금지
   - 사용한 SolidWorks API 메서드는 버전별 존재 여부를 [SolidWorks API Help](https://help.solidworks.com)에서 확인하고 주석에 링크 기재
2. `extractor/com_extractor.py` (경로 C)
   - 시트 순회 → 뷰 순회 → 표시 치수: 값, 공차 유형·상하한, 표시 문자열, 위치(시트 좌표)
   - 노트: 텍스트, 위치, 소속 뷰
   - BOM 테이블 셀 값, 참조 모델의 구성요소 수량(BOM 수량 검증용)
   - 시트 크기·스케일, (옵션) PDF 내보내기
3. `highlight/com_highlighter.py`
   - Excel/marks.json의 이슈 번호 → 해당 치수/노트 선택 + 색 변경(임시 레이어 `REVIEW_ISSUES` 또는 선택 상태만)
   - **원본 수정 금지 원칙**: 기본은 선택·줌만, 색 변경은 `--highlight-copy` 옵션으로 사본에서만
4. CLI: `--com` (추출 보완), `highlight <xlsx|json> --file <slddrw>`

## 테스트
- `[CLOUD]`: COM 객체를 Mock하여 변환 로직·좌표 변환·가드 동작 테스트
- `tests/win/` (`@pytest.mark.win`, Linux 자동 skip): 실도면으로 swformat 결과와 COM 결과 비교 리포트
- 사용자 확인:
  - [ ] 공차 값이 도면과 일치
  - [ ] 하이라이트 후 원본 파일 수정 시각이 변하지 않음
  - [ ] SolidWorks 미실행·라이선스 없음 상황에서 한국어 오류 메시지

## 완료 기준
- `--com` 사용 시 R02·R03 규칙이 "입력 부족 INFO" 대신 실제 판정
- `tools/make_fixture.py`로 COM 결과까지 포함한 익명화 픽스처 생성 → `[CLOUD]` 테스트에 반영
