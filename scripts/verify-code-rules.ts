import fs from 'node:fs';
import path from 'node:path';

/** Một vi phạm quy tắc code */
export interface RuleViolation {
  file: string;
  line: number;
  rule: string;
  text: string;
}

interface RuleDef {
  name: string;
  pattern: RegExp;
}

const RULES: RuleDef[] = [
  { name: 'Cấm debugger;', pattern: /^\s*debugger\s*;?/ },
  { name: 'Cấm console.log trong src/', pattern: /\bconsole\.log\s*\(/ },
  { name: 'Cấm tiền tố "_" lách biến/tham số không dùng', pattern: /\(\s*_[A-Za-z]*\s*[,)]|,\s*_[A-Za-z]*\s*[,)]/ },
  { name: 'Cấm hàm rỗng () => {} không giải thích', pattern: /\(\s*\)\s*=>\s*\{\s*\}/ },
];

const EXTENSIONS = new Set(['.ts', '.tsx']);

/**
 * Quét đệ quy các file .ts/.tsx trong thư mục
 * @param dir Thư mục gốc cần quét
 * @returns Danh sách đường dẫn file
 */
export function collectFiles(dir: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectFiles(full));
    else if (EXTENSIONS.has(path.extname(entry.name))) result.push(full);
  }
  return result;
}

/**
 * Kiểm tra nội dung một file theo bộ quy tắc
 * @param file Đường dẫn file (dùng để báo lỗi)
 * @param content Nội dung file
 * @returns Danh sách vi phạm
 */
export function checkContent(file: string, content: string): RuleViolation[] {
  const violations: RuleViolation[] = [];
  content.split(/\r?\n/).forEach((text, index) => {
    const trimmed = text.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    for (const rule of RULES) {
      if (rule.pattern.test(text)) {
        violations.push({ file, line: index + 1, rule: rule.name, text: trimmed });
      }
    }
  });
  return violations;
}

/**
 * Quét toàn bộ thư mục src/ và trả về danh sách vi phạm
 * @param srcDir Thư mục src
 * @returns Danh sách vi phạm
 */
export function checkDirectory(srcDir: string): RuleViolation[] {
  return collectFiles(srcDir).flatMap((file) => checkContent(file, fs.readFileSync(file, 'utf8')));
}

if (process.argv[1] && path.basename(process.argv[1]) === 'verify-code-rules.ts') {
  const violations = checkDirectory(path.join(process.cwd(), 'src'));
  if (violations.length > 0) {
    for (const v of violations) console.error(`${v.file}:${v.line} [${v.rule}] ${v.text}`);
    console.error(`\n❌ Phát hiện ${violations.length} vi phạm quy tắc code.`);
    process.exit(1);
  }
  console.warn('✅ Code rules: không có vi phạm.');
}
