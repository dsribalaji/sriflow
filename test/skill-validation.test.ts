/**
 * Structural validation tests for all sriflow skills.
 *
 * Validates:
 * - All 13 skills have valid frontmatter
 * - All skills have required sections (preamble, voice, completion)
 * - No hardcoded branch names in git commands
 * - Browser commands match command registry
 * - Cross-skill path consistency
 */

import { describe, test, expect } from 'bun:test';
import {
  extractBrowseCommands,
  validateSkill,
  extractFrontmatter,
  validateSkillStructure,
} from './helpers/skill-parser';
import * as fs from 'fs';
import * as path from 'path';

const SKILLS_DIR = path.resolve(import.meta.dir, '../skills');

// All 13 sriflow skills
const SRIFLOW_SKILLS = [
  'sriflow',
  'sriflow-trim',
  'sriflow-think',
  'sriflow-plan',
  'sriflow-plan-review',
  'sriflow-design',
  'sriflow-build',
  'sriflow-code-review',
  'sriflow-test',
  'sriflow-browser',
  'sriflow-ship',
  'sriflow-reflect',
  'sriflow-memory',
];

describe('All skills exist', () => {
  for (const skill of SRIFLOW_SKILLS) {
    test(`${skill}/SKILL.md exists`, () => {
      const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
      expect(fs.existsSync(skillPath)).toBe(true);
    });
  }
});

describe('Frontmatter validation', () => {
  for (const skill of SRIFLOW_SKILLS) {
    test(`${skill} has valid frontmatter with name`, () => {
      const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return; // Skip if not exists

      const fm = extractFrontmatter(skillPath);
      expect(fm.name).toBeDefined();
      expect(fm.name.length).toBeGreaterThan(0);
    });

    test(`${skill} has description`, () => {
      const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return;

      const fm = extractFrontmatter(skillPath);
      expect(fm.description).toBeDefined();
      expect(fm.description.length).toBeGreaterThan(0);
    });
  }
});

describe('Structure validation', () => {
  for (const skill of SRIFLOW_SKILLS) {
    test(`${skill} has required sections`, () => {
      const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return;

      const errors = validateSkillStructure(skillPath);
      expect(errors).toHaveLength(0);
    });
  }
});

describe('Browser command validation', () => {
  // Only validate skills that use browser commands
  const browserSkills = ['sriflow-browser', 'sriflow-build', 'sriflow-test'];

  for (const skill of browserSkills) {
    test(`${skill} has valid browser commands`, () => {
      const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return;

      const result = validateSkill(skillPath);
      expect(result.invalid).toHaveLength(0);
      expect(result.snapshotFlagErrors).toHaveLength(0);
    });
  }
});

describe('Cross-skill path consistency', () => {
  test('all skills reference SRIFLOW_MEMORY.md consistently', () => {
    for (const skill of SRIFLOW_SKILLS) {
      const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      const content = fs.readFileSync(skillPath, 'utf-8');
      // Check that memory references use the correct path
      if (content.includes('SRIFLOW_MEMORY')) {
        expect(content).toContain('SRIFLOW_MEMORY.md');
      }
    }
  });
});
