// 本機模擬後端（第 6.6 節）：docs/spec/api-contract.md 第 2 節的報告端點，以及市場總覽的 feed、market-pulse
// 用法：npm run mock-api → http://localhost:8787
// 資料讀自 public/data/reports/（先執行 npm run sync）。只使用 Node.js 內建模組。

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 8787;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS_DIR = path.join(ROOT, 'public', 'data', 'reports');
// 市場總覽：public/data/ 有正式檔就用正式檔，否則用 docs/examples/ 的示意資料
const MARKET_ENDPOINTS = {
  '/api/v1/feed': ['feed.json', 'feed-example.json'],
  '/api/v1/market-pulse': ['market-pulse.json', 'market-pulse-example.json'],
};

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

function sendRaw(res, status, body) {
  res.writeHead(status, HEADERS);
  res.end(body);
}

/** api-contract 第 1 節錯誤格式 */
function sendError(res, status, code, message) {
  sendRaw(res, status, JSON.stringify({ error: { code, message } }));
}

/** 原樣回傳檔案內容（不包裝、不修改，api-contract 第 2.2 節） */
async function sendFile(res, file) {
  sendRaw(res, 200, await readFile(file));
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  let status = 200;
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { ...HEADERS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' });
      res.end();
      status = 204;
    } else if (req.method === 'GET' && pathname === '/api/v1/reports') {
      try {
        await sendFile(res, path.join(REPORTS_DIR, 'index.json'));
      } catch {
        status = 500;
        sendError(res, 500, 'INTERNAL_ERROR', '找不到 public/data/reports/index.json，請先執行 npm run sync');
      }
    } else if (req.method === 'GET' && pathname in MARKET_ENDPOINTS) {
      const [real, example] = MARKET_ENDPOINTS[pathname];
      try {
        await sendFile(res, path.join(ROOT, 'public', 'data', real));
      } catch {
        await sendFile(res, path.join(ROOT, 'docs', 'examples', example));
      }
    } else if (req.method === 'GET' && pathname.startsWith('/api/v1/reports/')) {
      const id = decodeURIComponent(pathname.slice('/api/v1/reports/'.length));
      const safe = id !== '' && id !== 'index' && !/[/\\]|\.\./.test(id);
      try {
        if (!safe) throw new Error('unsafe id');
        await sendFile(res, path.join(REPORTS_DIR, `${id}.json`));
      } catch {
        status = 404;
        sendError(res, 404, 'REPORT_NOT_FOUND', `找不到報告：${id}`);
      }
    } else {
      status = 404;
      sendError(res, 404, 'NOT_FOUND', `沒有這個端點：${req.method} ${pathname}`);
    }
  } finally {
    console.log(`${req.method} ${pathname} → ${status}`);
  }
});

server.listen(PORT, () => {
  console.log(`mock-api 已啟動：http://localhost:${PORT}`);
  console.log(`  GET /api/v1/reports`);
  console.log(`  GET /api/v1/reports/<report_id>`);
  console.log(`  GET /api/v1/feed            （沒有 public/data/feed.json 時用示意資料）`);
  console.log(`  GET /api/v1/market-pulse    （沒有 public/data/market-pulse.json 時用示意資料）`);
  console.log('按 Ctrl + C 停止。');
});
