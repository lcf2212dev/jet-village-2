import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

type Layer = 'core' | 'game' | 'platform' | 'main' | 'other';

const ALLOWED: Readonly<Record<Layer, ReadonlySet<Layer>>> = {
  core: new Set(['core']),
  game: new Set(['core', 'game']),
  platform: new Set(['core', 'platform']),
  main: new Set(['core', 'game', 'platform', 'main', 'other']),
  other: new Set(['core', 'game', 'platform', 'main', 'other']),
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return entry.isFile() && entry.name.endsWith('.ts') ? [target] : [];
  });
}

function layerOf(relativePath: string): Layer {
  const normalized = relativePath.replaceAll(path.sep, '/');
  if (normalized === 'src/main.ts' || normalized === 'src/main') return 'main';
  if (normalized.startsWith('src/core/')) return 'core';
  if (normalized.startsWith('src/game/')) return 'game';
  if (normalized.startsWith('src/platform/')) return 'platform';
  return 'other';
}

function moduleSpecifiers(source: ts.SourceFile): string[] {
  const result: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      result.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]!)
    ) {
      result.push(node.arguments[0]!.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

export function architectureViolations(projectRoot: string): string[] {
  const srcRoot = path.join(projectRoot, 'src');
  const violations: string[] = [];
  for (const file of sourceFiles(srcRoot)) {
    const relative = path.relative(projectRoot, file);
    const sourceLayer = layerOf(relative);
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    for (const specifier of moduleSpecifiers(source)) {
      if (!specifier.startsWith('.')) continue;
      const target = path.resolve(path.dirname(file), specifier);
      const targetLayer = layerOf(path.relative(projectRoot, target));
      if (!ALLOWED[sourceLayer].has(targetLayer)) {
        violations.push(`${relative}: ${sourceLayer} -> ${targetLayer} via "${specifier}"`);
      }
    }
  }
  return violations.sort();
}

function main(): void {
  const root = path.resolve(import.meta.dirname, '..');
  const violations = architectureViolations(root);
  if (violations.length > 0) {
    console.error('Architecture dependency violations:');
    for (const violation of violations) console.error(`  - ${violation}`);
    process.exitCode = 1;
    return;
  }
  console.log('architecture:check OK — src layer dependencies are valid.');
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main();
