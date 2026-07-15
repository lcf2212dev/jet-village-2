#!/usr/bin/env node
/**
 * CLI: generate an asset via the local FastAPI service (OpenAI Images).
 *
 * Usage:
 *   npm run assets:generate -- --kind flora --subject "oak tree" --name oak-01
 *   npm run assets:generate -- --prompt "pixel art bush..." --name bush
 */

const API = process.env.VITE_ASSET_API_URL || process.env.ASSET_API_URL || 'http://127.0.0.1:8787';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log(`Usage:
  node tools/generate-asset.mjs --kind <character|building|flora|path> --subject "..." --name <stem>
  node tools/generate-asset.mjs --prompt "full prompt..." --name <stem>
  Options: --size 1024x1024|1024x1536|1536x1024  --quality low|medium|high  --extra "..."
API: ${API}`);
    process.exit(0);
  }

  const body = {
    name: args.name || 'asset',
  };
  if (args.prompt) {
    body.prompt = args.prompt;
  } else {
    if (!args.kind) {
      console.error('Provide --kind + --subject, or --prompt');
      process.exit(1);
    }
    body.kind = args.kind;
    body.subject = args.subject || '';
    if (!body.subject) {
      console.error('--subject is required with --kind');
      process.exit(1);
    }
  }
  if (args.size) body.size = args.size;
  if (args.quality) body.quality = args.quality;
  if (args.extra) body.extra = args.extra;

  console.log(`POST ${API}/v1/generate`, {
    ...body,
    prompt: body.prompt ? `[${String(body.prompt).length} chars]` : undefined,
    subject: body.subject ? `[${String(body.subject).length} chars]` : undefined,
  });

  const res = await fetch(`${API}/v1/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    console.error('Generation failed:', data.error || data.detail || res.statusText, data);
    process.exit(1);
  }

  console.log('OK');
  console.log(' kind: ', data.kind);
  console.log(' path:', data.image_path);
  console.log(' url: ', data.image_url);
  console.log(' model:', data.model, data.quality, data.size);
  if (data.notes) console.log(' notes:', data.notes);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
