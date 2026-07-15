// PreToolUse (Write|Edit): blocks manual edits to generated OpenAI assets.
// exit 2 + stderr = block tool call.
import { readFileSync } from 'node:fs';
import path from 'node:path';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const abs = path.resolve(file);
const rel = path.relative(root, abs).replaceAll('\\', '/');
const normalized = abs.replaceAll('\\', '/');

const blocked =
  rel === 'public/assets/generated' ||
  rel.startsWith('public/assets/generated/') ||
  rel === 'assets/generated' ||
  rel.startsWith('assets/generated/') ||
  normalized.includes('/public/assets/generated/') ||
  normalized.endsWith('/public/assets/generated') ||
  normalized.includes('/assets/generated/');

if (blocked) {
  console.error(
    `Bloqueado: "${rel || normalized}" é asset GERADO (OpenAI pipeline). ` +
      `Use a skill generate-asset / npm run assets:generate (API FastAPI). ` +
      `Após revisão, promova para public/assets/sprites|tiles|ui|maps/.`,
  );
  process.exit(2);
}

process.exit(0);
