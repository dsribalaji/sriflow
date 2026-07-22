import { describe, test, expect } from 'bun:test';
import { evaluateSpec, loadEvalFiles, loadAllEvalSpecs } from './eval-runner';
import * as fs from 'fs';
import * as path from 'path';
import type { EvalSpec } from './eval-runner';

const SKILLS_DIR = path.join(import.meta.dir, '..', 'skills');

function readSkillContent(skillName: string): string {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  return fs.readFileSync(skillPath, 'utf-8');
}

describe('eval-runner', () => {
  describe('evaluateSpec', () => {
    const mockSpec: EvalSpec = {
      skill: 'sriflow-code-review',
      version: '2.0.0',
      evals: [
        {
          id: 'review-01',
          prompt: 'test',
          expected_patterns: ['severity', 'blocking'],
          anti_patterns: ['DO NOT SAY THIS'],
          tags: ['test'],
        },
      ],
    };

    test('passes when all expected and no anti-patterns match', () => {
      const results = evaluateSpec(mockSpec, 'Must use severity labels. blocking is critical.');
      expect(results[0].passed).toBe(true);
      expect(results[0].errors).toEqual([]);
    });

    test('fails when expected pattern missing', () => {
      const results = evaluateSpec(mockSpec, 'only severity is mentioned and not the other pattern');
      expect(results[0].passed).toBe(false);
      expect(results[0].errors.some(e => e.includes('blocking'))).toBe(true);
    });

    test('fails when anti-pattern matches', () => {
      const results = evaluateSpec(mockSpec, 'severity blocking DO NOT SAY THIS');
      expect(results[0].passed).toBe(false);
    });

    test('handles OR patterns', () => {
      const spec: EvalSpec = {
        skill: 'test',
        version: '1.0',
        evals: [{
          id: 't1',
          prompt: '',
          expected_patterns: ['option1 OR option2'],
          anti_patterns: [],
          tags: [],
        }],
      };
      expect(evaluateSpec(spec, 'Found option1')[0].passed).toBe(true);
      expect(evaluateSpec(spec, 'Found option2')[0].passed).toBe(true);
      expect(evaluateSpec(spec, 'Found neither')[0].passed).toBe(false);
    });
  });

  describe('loadEvalFiles', () => {
    test('loads all eval files from skill-evals directory', () => {
      const evalDir = path.join(import.meta.dir, 'skill-evals');
      const specs = loadEvalFiles(evalDir);
      expect(specs.length).toBeGreaterThanOrEqual(3);
      const skills = specs.map(s => s.skill);
      expect(skills).toContain('sriflow-code-review');
      expect(skills).toContain('sriflow-build');
      expect(skills).toContain('sriflow-test');
    });

    test('each eval file has valid structure', () => {
      const evalDir = path.join(import.meta.dir, 'skill-evals');
      const specs = loadEvalFiles(evalDir);
      for (const spec of specs) {
        expect(spec.skill).toBeDefined();
        expect(spec.version).toBeDefined();
        expect(Array.isArray(spec.evals)).toBe(true);
        for (const evalCase of spec.evals) {
          expect(evalCase.id).toBeDefined();
          expect(evalCase.prompt).toBeDefined();
          expect(Array.isArray(evalCase.expected_patterns)).toBe(true);
          expect(Array.isArray(evalCase.anti_patterns)).toBe(true);
        }
      }
    });
  });

  describe('eval-content integration', () => {
    test('existing code-review evals pass against SKILL.md', () => {
      const content = readSkillContent('sriflow-code-review');
      const spec: EvalSpec = {
        skill: 'sriflow-code-review',
        version: '2.0.0',
        evals: [
          {
            id: 'review-content-01',
            prompt: 'verify core content',
            expected_patterns: [
              'blocking', 'severity', 'OWASP',
              'CODE_REVIEW.md', 'Pre-Report Confidence',
            ],
            anti_patterns: [
              'skip security',
            ],
            tags: ['content'],
          },
        ],
      };
      const results = evaluateSpec(spec, content);
      expect(results[0].passed).toBe(true);
    });

    test('existing build evals pass against SKILL.md', () => {
      const content = readSkillContent('sriflow-build');
      const spec: EvalSpec = {
        skill: 'sriflow-build',
        version: '2.0.0',
        evals: [
          {
            id: 'build-content-01',
            prompt: 'verify build content',
            expected_patterns: [
              'Step 0', 'PLAN.md', 'DESIGN.md',
              'pre-build safety', 'existing code scan',
            ],
            anti_patterns: ['skip Step 2'],
            tags: ['content'],
          },
        ],
      };
      const results = evaluateSpec(spec, content);
      expect(results[0].passed).toBe(true);
    });

    test('existing test evals pass against SKILL.md', () => {
      const content = readSkillContent('sriflow-test');
      const spec: EvalSpec = {
        skill: 'sriflow-test',
        version: '2.0.0',
        evals: [
          {
            id: 'test-content-01',
            prompt: 'verify test content',
            expected_patterns: [
              'golden path', 'edge case', 'QA_REPORT.md',
              'PASS', 'FAIL', 'BLOCKED',
            ],
            anti_patterns: ['skip golden path'],
            tags: ['content'],
          },
        ],
      };
      const results = evaluateSpec(spec, content);
      expect(results[0].passed).toBe(true);
    });
  });
});
