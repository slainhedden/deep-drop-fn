import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(),{
    name:'build-provenance',
    apply:'build',
    generateBundle(){
      const metadata=fileURLToPath(new URL('./.generated/build-info.json',import.meta.url));
      this.emitFile({type:'asset',fileName:'build-info.json',source:readFileSync(metadata,'utf8')});
    },
  }],
  test: { environment: 'jsdom', maxWorkers: 2, testTimeout: 15000 },
});
