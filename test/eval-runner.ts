import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect } from 'bun:test';

export interface EvalCase {
  id: string;
  prompt: string;
  expected_patterns: string[];
  anti_patterns: string[];
  tags: string[];
}

export interface EvalSpec {
  skill: string;
  version: string;
  evals: EvalCase[];
}

export interface EvalResult {
  id: string;
  skill: string;
  passed: boolean;
  expectedMatches: { pattern: string; matched: boolean }[];
  antiPatternViolations: { pattern: string; matched: boolean }[];
  errors: string[];
}

function normalizePattern(p: string): RegExp {
  const parts = p.split(' OR ');
  if (parts.length > 1) {
    const joined = parts.map(part => `(?:${part})`).join('|');
    return new RegExp(joined, 'i');
  }
  return new RegExp(p, 'i');
}

function applyPatterns(text: string, patterns: string[]): { pattern: string; matched: boolean }[] {
  return patterns.map(p => ({
    pattern: p,
    matched: normalizePattern(p).test(text),
  }));
}

export function evaluateSpec(spec: EvalSpec, skillContent: string): EvalResult[] {
  return spec.evals.map(evalCase => {
    const errors: string[] = [];
    const expectedMatches = applyPatterns(skillContent, evalCase.expected_patterns);
    const antiPatternViolations = applyPatterns(skillContent, evalCase.anti_patterns);

    const allExpectedMatch = expectedMatches.every(m => m.matched);
    const noAntiMatch = antiPatternViolations.every(m => !m.matched);

    if (!allExpectedMatch) {
      const missing = expectedMatches.filter(m => !m.matched).map(m => m.pattern);
      errors.push(`Missing expected patterns: ${missing.join(', ')}`);
    }
    if (!noAntiMatch) {
      const violated = antiPatternViolations.filter(m => m.matched).map(m => m.pattern);
      errors.push(`Anti-patterns found: ${violated.join(', ')}`);
    }

    return {
      id: evalCase.id,
      skill: spec.skill,
      passed: allExpectedMatch && noAntiMatch,
      expectedMatches,
      antiPatternViolations,
      errors,
    };
  });
}

export function loadEvalFiles(dir: string): EvalSpec[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('-evals.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf-8');
    return JSON.parse(content) as EvalSpec;
  });
}

export function loadAllEvalSpecs(): EvalSpec[] {
  const evalDir = path.join(import.meta.dir, 'skill-evals');
  return loadEvalFiles(evalDir);
}

export function findOrphanedPatterns(spec: EvalSpec): string[] {
  const skillDir = path.join(import.meta.dir, '..', 'skills', spec.skill);
  const refDir = path.join(skillDir, 'reference');

  const orphaned: string[] = [];
  for (const evalCase of spec.evals) {
    for (const pattern of [...evalCase.expected_patterns, ...evalCase.anti_patterns]) {
      if (pattern.startsWith('reference/') && fs.existsSync(refDir)) {
        const refFile = path.join(refDir, pattern.replace('reference/', ''));
        if (!fs.existsSync(refFile)) {
          orphaned.push(`${evalCase.id}: ${pattern}`);
        }
      }
    }
  }
  return orphaned;
}
