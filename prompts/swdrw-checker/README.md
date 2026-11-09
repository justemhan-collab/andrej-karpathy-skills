# SOLIDWORKS 도면 자동 검토 프로그램 — 하이브리드 개발 프롬프트 세트

SLDDRW/DWG 도면에서 타이틀블록·BOM·치수·노트를 추출 → 체크리스트 규칙 검사 → Excel·PDF 레드마킹 출력하는 프로그램을
Claude Code로 **단계별** 개발하기 위한 프롬프트 모음.

## 1. 하이브리드 구조 요약

| 축 | 구성 |
|---|---|
| 개발 환경 | `[CLOUD]` Linux 클라우드 세션(코어·테스트) + `[WIN]` SolidWorks 설치 PC(COM·실도면 검증) |
| 추출 경로 | A. swformat(파일 직접) · B. PDF 텍스트 좌표 · C. COM API · D. DWG(ezdwg/ezdxf) → 공통 모델로 병합 |
| 데이터 공유 | Git 저장소 1개, 실도면 대신 **익명화 JSON 픽스처** 커밋 |

## 2. 파일 구성

| 파일 | 환경 | 내용 |
|---|---|---|
| `00_master_prompt.md` | 공통 | 역할·목표·하이브리드 구조·폴더 구조·작업 규칙·보고 형식 (**매 세션 첫 메시지**) |
| `phases/00_architecture.md` | CLOUD→WIN | 아키텍처 확정, 라이브러리 스파이크, 규칙-추출경로 매트릭스 |
| `phases/01_scaffold.md` | CLOUD | 패키지·데이터 모델·설정·로깅·CLI 골격 |
| `phases/02_extractor.md` | CLOUD+WIN | swformat / PDF / DWG 추출기 + 병합 |
| `phases/03_checker.md` | CLOUD | 규칙 엔진 + 필수 규칙 8종 + 사용자 규칙 추가 구조 |
| `phases/04_reporter.md` | CLOUD | Excel(오류리스트/추출데이터) · 콘솔 요약 · 마크 JSON |
| `phases/05_redmark.md` | CLOUD+WIN | PDF 빨간 박스 + 오류 번호 |
| `phases/06_com.md` | WIN | SolidWorks COM 추출 보완 · 하이라이트 |
| `phases/07_perf_test_release.md` | CLOUD+WIN | 성능·통합 테스트·배포·GUI 확장점 |

## 3. 사용 방법

1. 새 저장소(예: `swdrw-checker`)를 만들고 Claude Code 세션을 연다.
2. 첫 메시지: `00_master_prompt.md` 전체 + `phases/00_architecture.md` 전체를 붙여넣는다.
3. Claude가 "Phase N 완료 보고"를 내면 내용 확인 → `[WIN]` 체크리스트 수행 → 다음 Phase 파일을 붙여넣는다.
4. 세션이 바뀌면 다시 `00_master_prompt.md` + 현재 Phase 파일 + 직전 완료 보고를 붙여넣는다.

## 4. 사전 확인 결과 (2026-11-09)

| 항목 | 상태 | 출처 |
|---|---|---|
| `swformat` | PyPI 미등록, GitHub `KenM76/swformat` git 설치, v0.0.1 Pre-Alpha, Python ≥3.11, Apache-2.0 | github.com/KenM76/swformat README·docs/FEATURES.md |
| swformat SLDDRW 읽기 | 시트·뷰·BOM 테이블·노트/타이틀블록 텍스트·표시 치수 문자열·커스텀 프로퍼티 가능 | 동상 |
| swformat 한계 | 공차 정보 문서화 없음, 치수/노트 좌표 없음, SW 2026 포맷만 검증, 실도면 치수 개수 과다 집계 사례 | 동상 |
| `ezdwg` | 0.19.2 (2026-11-06), MIT, DWG R13~R2018, TEXT/MTEXT/DIMENSION 읽기, TABLE 읽기 문서화 없음 | pypi.org/project/ezdwg |
| `ezdxf` / `PyMuPDF` / `openpyxl` / `pywin32` | 1.4.5 / 2.1 / 3.1.5 / 312 | PyPI |

## 5. 확인 필요

- [ ] 사내 SolidWorks 버전 (swformat 검증 범위는 SW 2026뿐)
- [ ] 타이틀블록 커스텀 프로퍼티명·BOM 헤더명 (설정 파일 매핑용)
- [ ] 사내 일반공차 표준 문구 (`KS B ISO 2768-m` 외 허용 등급)
- [ ] 지시 없는 모따기/필렛 사내 기본값 (예: C0.5 / R0.5)
- [ ] "수 초 이내" 성능 목표의 기준 파일 크기·시트 수
- [ ] 도면 PDF 동시 출도 여부 (레드마킹 경로 B 가용성)
