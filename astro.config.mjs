import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://unicode.wangruofeng007.com',
  output: 'static',
  build: {
    format: 'directory'
  }
});
