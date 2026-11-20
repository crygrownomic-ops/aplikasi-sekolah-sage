import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Aplikasi memakai script klasik (bukan ES module) agar tetap bisa dibuka
// langsung lewat file statis dan memakai event handler inline di HTML.
// Vite tidak membundel script tersebut, jadi folder js/ dan pages/ disalin
// ke folder build secara eksplisit.
function copyRuntimeFolders() {
  return {
    name: 'copy-siakad-runtime-folders',
    apply: 'build',
    closeBundle() {
      const root = process.cwd();
      const output = path.resolve(root, 'dist');
      ['js', 'pages'].forEach((folder) => {
        const source = path.resolve(root, folder);
        if (fs.existsSync(source)) {
          fs.cpSync(source, path.resolve(output, folder), { recursive: true });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [copyRuntimeFolders()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
