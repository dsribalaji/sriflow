/**
 * SKILL.md parser and validator for sriflow.
 *
 * Extracts $B commands from code blocks, validates them against
 * the browse command registry and snapshot flags.
 *
 * Adapted from gstack's skill-parser.ts — sriflow-specific commands only.
 */

import { ALL_COMMANDS } from '../../browse/src/commands';
import { parseSnapshotArgs } from '../../browse/src/snapshot';
import * as fs from 'fs';
import * as path from 'path';

/** CLI-only commands: valid $B invocations handled by the CLI, not the server */
const CLI_COMMANDS = new Set(['status']);

export interface BrowseCommand {
  command: string;
  args: string[];
  line: number;
  raw: string;
}

export interface ValidationResult {
  valid: BrowseCommand[];
  invalid: BrowseCommand[];
  snapshotFlagErrors: Array<{ command: BrowseCommand; error: string }>;
  warnings: string[];
}

/**
 * Extract all $B invocations from bash code blocks in a SKILL.md file.
 */
export function extractBrowseCommands(skillPath: string): BrowseCommand[] {
  const content = fs.readFileSync(skillPath, 'utf-8');
  const lines = content.split('\n');
  const commands: BrowseCommand[] = [];

  let inBashBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect code block boundaries
    if (line.trimStart().startsWith('```')) {
      if (inBashBlock) {
        inBashBlock = false;
      } else if (line.trimStart().startsWith('```bash')) {
        inBashBlock = true;
      }
      continue;
    }

    if (!inBashBlock) continue;

    // Match lines with $B command invocations — stop at shell operators
    const matches = line.matchAll(/\$B\s+(\S+)(?:\s+([^$&|;]*))?/g);
    for (const match of matches) {
      const command = match[1];
      let argsStr = (match[2] || '').trim();

      // Strip inline comments (# ...) — but not inside quotes
      let inQuote = false;
      for (let j = 0; j < argsStr.length; j++) {
        if (argsStr[j] === '"') inQuote = !inQuote;
        if (argsStr[j] === '#' && !inQuote) {
          argsStr = argsStr.slice(0, j).trim();
          break;
        }
      }

      // Parse args — handle quoted strings
      const args: string[] = [];
      if (argsStr) {
        const argMatches = argsStr.matchAll(/"([^"]*)"|(\S+)/g);
        for (const am of argMatches) {
          args.push(am[1] ?? am[2]);
        }
      }

      commands.push({
        command,
        args,
        line: i + 1, // 1-based
        raw: match[0].trim(),
      });
    }
  }

  return commands;
}

/**
 * Extract and validate all $B commands in a SKILL.md file.
 */
export function validateSkill(skillPath: string): ValidationResult {
  const commands = extractBrowseCommands(skillPath);
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    snapshotFlagErrors: [],
    warnings: [],
  };

  if (commands.length === 0) {
    result.warnings.push('no $B commands found');
    return result;
  }

  for (const cmd of commands) {
    if (!ALL_COMMANDS.has(cmd.command) && !CLI_COMMANDS.has(cmd.command)) {
      result.invalid.push(cmd);
      continue;
    }

    // Validate snapshot flags
    if (cmd.command === 'snapshot' && cmd.args.length > 0) {
      try {
        parseSnapshotArgs(cmd.args);
      } catch (err: any) {
        result.snapshotFlagErrors.push({ command: cmd, error: err.message });
        continue;
      }
    }

    result.valid.push(cmd);
  }

  return result;
}

/**
 * Extract frontmatter fields from a SKILL.md file.
 */
export function extractFrontmatter(skillPath: string): Record<string, string> {
  const content = fs.readFileSync(skillPath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterMatch[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    frontmatter[key] = value;
  }
  return frontmatter;
}

/**
 * Check if a skill file has required sections.
 */
export function validateSkillStructure(skillPath: string): string[] {
  const content = fs.readFileSync(skillPath, 'utf-8');
  const errors: string[] = [];

  // Check for preamble (first 20 lines should have context)
  const lines = content.split('\n').slice(0, 20);
  const hasPreamble = lines.some(l => l.trim().length > 0 && !l.startsWith('#'));
  if (!hasPreamble) {
    errors.push('missing preamble (first 20 lines should have context)');
  }

  // Check for voice section
  if (!content.includes('Voice') && !content.includes('voice')) {
    errors.push('missing voice section');
  }

  // Check for completion status protocol
  const lower = content.toLowerCase();
  if (!lower.includes('completion') && !lower.includes('status')) {
    errors.push('missing completion status protocol');
  }

  return errors;
}
