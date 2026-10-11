import fs from 'node:fs';
import path from 'node:path';

const hooksDir = path.join(process.cwd(), '.git', 'hooks');

if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
  console.warn('Không tìm thấy .git, bỏ qua cài hook (môi trường CI/Vercel).');
  process.exit(0);
}

fs.mkdirSync(hooksDir, { recursive: true });
const hookPath = path.join(hooksDir, 'pre-push');
const script = `#!/bin/sh
echo "[pre-push] rules -> types -> test -> build"
npm run pre-push || { echo "[pre-push] Thất bại: push bị hủy."; exit 1; }
`;
fs.writeFileSync(hookPath, script, { mode: 0o755 });
console.warn('✅ Đã cài .git/hooks/pre-push');
