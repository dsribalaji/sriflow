/**
 * Unit tests for SKILL.md parser and validator.
 *
 * Tests command extraction, validation, and structure checks.
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

describe('extractBrowseCommands', () => {
  test('extracts $B commands from bash code blocks', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `
# Test Skill

\`\`\`bash
$B goto https://example.com
$B click @e3
\`\`\`
`);
    const commands = extractBrowseCommands(tmpFile);
    expect(commands).toHaveLength(2);
    expect(commands[0].command).toBe('goto');
    expect(commands[0].args).toEqual(['https://example.com']);
    expect(commands[1].command).toBe('click');
    expect(commands[1].args).toEqual(['@e3']);
    fs.unlinkSync(tmpFile);
  });

  test('ignores non-bash code blocks', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `
\`\`\`json
{ "command": "$B goto" }
\`\`\`

\`\`\`bash
$B text
\`\`\`
`);
    const commands = extractBrowseCommands(tmpFile);
    expect(commands).toHaveLength(1);
    expect(commands[0].command).toBe('text');
    fs.unlinkSync(tmpFile);
  });

  test('strips inline comments', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `
\`\`\`bash
$B click @e3 # click the button
\`\`\`
`);
    const commands = extractBrowseCommands(tmpFile);
    expect(commands[0].args).toEqual(['@e3']);
    fs.unlinkSync(tmpFile);
  });

  test('handles quoted args', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `
\`\`\`bash
$B fill @e4 "hello world"
\`\`\`
`);
    const commands = extractBrowseCommands(tmpFile);
    expect(commands[0].args).toEqual(['@e4', 'hello world']);
    fs.unlinkSync(tmpFile);
  });

  test('returns empty array for no bash blocks', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, '# No code blocks\nJust text.');
    const commands = extractBrowseCommands(tmpFile);
    expect(commands).toHaveLength(0);
    fs.unlinkSync(tmpFile);
  });
});

describe('validateSkill', () => {
  test('returns valid for known commands', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `
\`\`\`bash
$B goto https://example.com
$B text
\`\`\`
`);
    const result = validateSkill(tmpFile);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(0);
    fs.unlinkSync(tmpFile);
  });

  test('detects invalid commands', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `
\`\`\`bash
$B nonexistent-command
\`\`\`
`);
    const result = validateSkill(tmpFile);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].command).toBe('nonexistent-command');
    fs.unlinkSync(tmpFile);
  });

  test('warns on no commands', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, '# No commands here');
    const result = validateSkill(tmpFile);
    expect(result.warnings).toContain('no $B commands found');
    fs.unlinkSync(tmpFile);
  });
});

describe('extractFrontmatter', () => {
  test('extracts key-value pairs from frontmatter', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `---
name: test-skill
description: A test skill
triggers: test, testing
---
# Content
`);
    const fm = extractFrontmatter(tmpFile);
    expect(fm.name).toBe('test-skill');
    expect(fm.description).toBe('A test skill');
    expect(fm.triggers).toBe('test, testing');
    fs.unlinkSync(tmpFile);
  });

  test('returns empty object for no frontmatter', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, '# No frontmatter');
    const fm = extractFrontmatter(tmpFile);
    expect(Object.keys(fm)).toHaveLength(0);
    fs.unlinkSync(tmpFile);
  });
});

describe('validateSkillStructure', () => {
  test('returns empty array for valid skill', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `---
name: test
---
This is a preamble with some context.

# Voice
Speak clearly.

## completion status
Mark as done.
`);
    const errors = validateSkillStructure(tmpFile);
    expect(errors).toHaveLength(0);
    fs.unlinkSync(tmpFile);
  });

  test('detects missing voice section', () => {
    const tmpFile = `/tmp/test-skill-${Date.now()}.md`;
    fs.writeFileSync(tmpFile, `---
name: test
---
This is a preamble.

## Completion
Done.
`);
    const errors = validateSkillStructure(tmpFile);
    expect(errors.some(e => e.includes('voice'))).toBe(true);
    fs.unlinkSync(tmpFile);
  });
});
