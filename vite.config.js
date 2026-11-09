import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function devApiPlugin() {
  let timer = null;

  async function pollAndIngest() {
    try {
      const { storage } = await import('./server/storage.js');
      await storage.init();
      const res = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data?.list || [];
        for (const item of list) {
          await storage.saveRound(item);
        }
      }
    } catch {}
  }

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      pollAndIngest();
      timer = setInterval(pollAndIngest, 15000);
      server.httpServer?.on('close', () => {
        if (timer) clearInterval(timer);
      });

      server.middlewares.use(async (req, res, next) => {
        const host = req.headers.host || 'localhost:5173';
        const url = new URL(req.url, `http://${host}`);
        if (url.pathname === '/api/history' || url.pathname === '/api/learning/history') {
          try {
            const { storage } = await import('./server/storage.js');
            await storage.init();
            const limit = Math.min(10000, Math.max(10, parseInt(url.searchParams.get('limit') || '5000', 10)));
            const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
            const history = await storage.getHistory(limit, offset);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: history.length, limit, offset, list: history }));
            return;
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }
        if (url.pathname === '/api/day' || url.pathname === '/api/learning/day') {
          try {
            const { storage } = await import('./server/storage.js');
            await storage.init();
            const daily = await storage.getDailyProgress(url.searchParams.get('date'));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(daily));
            return;
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/draw-api': {
        target: 'https://draw.ar-lottery06.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/draw-api/, ''),
        secure: false,
      }
    }
  }
})
