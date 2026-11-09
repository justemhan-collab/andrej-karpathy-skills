// 도면 검토기 E2E 테스트: 샘플 PDF 2건, JSON 샘플, 합성 DXF를 검토해 기대 결과를 확인한다.
// 실행: cd apps/drawing-checker/tests && npm install && npm test
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const APP = path.join(__dirname, '..', 'index.html');
const SAMPLE_JSON = path.join(__dirname, '..', 'samples', 'drawing-data.sample.json');
const NM = path.join(__dirname, 'node_modules');
const LIBS = {
  'pdf.min.js': 'pdfjs-dist/build/pdf.min.js',
  'pdf.worker.min.js': 'pdfjs-dist/build/pdf.worker.min.js',
  'pdf-lib.min.js': 'pdf-lib/dist/pdf-lib.min.js',
  'xlsx.full.min.js': 'xlsx/dist/xlsx.full.min.js',
  'dxf-parser.js': 'dxf-parser/dist/dxf-parser.js',
};
// 최소 DXF: 치수 1개(120), 노트, 타이틀블록 일부
const DXF = ['0','SECTION','2','ENTITIES',
  '0','TEXT','8','0','10','0','20','-20','40','3.5','1','NOTES',
  '0','TEXT','8','0','10','0','20','-26','40','2.5','1','1. GENERAL TOLERANCE: KS B ISO 2768-m',
  '0','TEXT','8','0','10','150','20','-20','40','2','1','MATERIAL',
  '0','TEXT','8','0','10','150','20','-26','40','3','1','SUS304',
  '0','TEXT','8','0','10','190','20','-20','40','2','1','FINISH',
  '0','DIMENSION','8','0','10','0','20','95','11','60','21','95','13','0','23','80','14','120','24','80','70','32','1','<>',
  '0','LINE','8','0','10','0','20','0','11','120','21','0',
  '0','ENDSEC','0','EOF'].join('\n');

(async () => {
  const html = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>${fs.readFileSync(APP, 'utf8')}</body></html>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drc-'));
  const dxfPath = path.join(tmp, 'test.dxf'); fs.writeFileSync(dxfPath, DXF);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (u === 'http://app.test/') return r.fulfill({ body: html, contentType: 'text/html' });
    const k = Object.keys(LIBS).find((k) => u.endsWith('/' + k));
    if (k) return r.fulfill({ body: fs.readFileSync(path.join(NM, LIBS[k])), contentType: 'application/javascript' });
    return r.abort();
  });
  const counts = () => page.$eval('#summary', (e) => { const n = [...e.querySelectorAll('.count b')].map((b) => +b.textContent); return { files: n[0], err: n[1], warn: n[2], info: n[3] }; });
  const rules = () => page.$$eval('.issue .rid', (els) => els.map((e) => e.textContent));
  let pass = 0; const ok = (name, fn) => { fn(); pass++; console.log('  ✔', name); };

  await page.goto('http://app.test/');
  await page.waitForSelector('.issue', { timeout: 20000 });
  console.log('[1] 샘플 PDF 2건');
  const c1 = await counts();
  ok('파일 2 · 오류 7 · 경고 4 · 정보 1', () => assert.deepEqual(c1, { files: 2, err: 7, warn: 4, info: 1 }));
  const r1 = await rules();
  ok('샘플1 규칙 R01 R02 R04 R05 R07 R08 검출', () => ['R01', 'R02', 'R04', 'R05', 'R07', 'R08'].forEach((r) => assert.ok(r1.includes(r), r)));
  await page.click('#fileList button[data-i="1"]');
  const r2 = await rules();
  ok('샘플2 R03 3건 + R06 검출', () => { assert.equal(r2.filter((r) => r === 'R03').length, 3); assert.ok(r2.includes('R06')); });
  await page.click('#fileList button[data-i="0"]');
  await page.click('.tab[data-t="bom"]');
  const bom = await page.$eval('#dataTable', (e) => e.innerText);
  ok('BOM 4행 추출 (TUBE 40 / Ø45x200)', () => { assert.match(bom, /TUBE 40\s+Ø45x200/); assert.equal((bom.match(/JS-SAMPLE-0001-0\d/g) || []).length, 3); });
  const [x] = await Promise.all([page.waitForEvent('download'), page.click('#btnExcel')]);
  ok('Excel 파일명 YYMMDD_HHMM_drawing-review.xlsx', () => assert.match(x.suggestedFilename(), /^\d{6}_\d{4}_drawing-review\.xlsx$/));
  const [red] = await Promise.all([page.waitForEvent('download'), page.click('#btnRedmark')]);
  const redPath = path.join(tmp, 'red.pdf'); await red.saveAs(redPath);
  ok('레드마킹 PDF 생성', () => assert.ok(fs.readFileSync(redPath).subarray(0, 5).toString() === '%PDF-'));

  console.log('[2] JSON (Python 추출기 인터페이스)');
  await page.setInputFiles('#fileInput', SAMPLE_JSON); await page.waitForTimeout(800);
  const r3 = await rules();
  ok('R02 인스턴스 불일치 + R04 Finish 공란 + R05 승인 공란', () => ['R02', 'R04', 'R05'].forEach((r) => assert.ok(r3.includes(r), r)));

  console.log('[3] DXF');
  await page.setInputFiles('#fileInput', dxfPath); await page.waitForTimeout(800);
  await page.click('.tab[data-t="dim"]');
  const dims = await page.$eval('#dataTable', (e) => e.innerText);
  ok('DIMENSION 측정값 120 추출', () => assert.match(dims, /\b120\b/));
  const r4 = await rules();
  ok('DXF R04(Finish 공란) 검출, R06 미검출', () => { assert.ok(r4.includes('R04')); assert.ok(!r4.includes('R06')); });

  ok('스크립트 오류 없음', () => assert.deepEqual(errors, []));
  await browser.close();
  console.log(`\n통과 ${pass}건`);
})().catch((e) => { console.error('실패:', e.message); process.exit(1); });
