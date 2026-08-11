import { defineConfig } from 'astro/config';

export default defineConfig({
  // Canonical origin. Production is served at this domain (the legacy
  // wangruofeng.github.io URL 301-redirects here). Canonical tags, og:url,
  // JSON-LD urls, and the sitemap are all derived from `site`, so changing
  // the canonical domain only requires editing this one value.
  site: 'https://blog.wangruofeng007.com',
  base: '/unicode-picker/',
  output: 'static',
  build: {
    format: 'directory'
  }
});
