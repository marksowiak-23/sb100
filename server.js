import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const appEnv = process.env.VITE_APP_ENV || process.env.SB_ENV || 'prod';
const isProd = appEnv === 'prod';

// Search engine index control: Enforce X-Robots-Tag header on non-production environments
if (!isProd) {
  app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
  });
}

// Dynamic robots.txt route
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  if (!isProd) {
    res.send("User-agent: *\nDisallow: /\n");
  } else {
    res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://storybook.ai/sitemap.xml\n");
  }
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html for Single Page Application routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
