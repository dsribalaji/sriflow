/**
 * Screenshot size guard — keep full-page screenshots ≤ 2000px max-dim.
 *
 * The Anthropic vision API rejects images whose longest dimension exceeds
 * 2000 image-pixels (post deviceScaleFactor). Full-page screenshots of long
 * pages routinely exceed that, silently bricking the session.
 *
 * trim: sharp dependency removed for sriflow (solo use). Returns original buffer.
 */

import { writeFileSync, readFileSync } from "fs";

const MAX_DIMENSION_PX = 2000;

export interface SizeGuardResult {
  resized: boolean;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export async function guardScreenshotBuffer(input: Buffer): Promise<{ buffer: Buffer; result: SizeGuardResult }> {
  return {
    buffer: input,
    result: { resized: false, width: 0, height: 0, originalWidth: 0, originalHeight: 0 },
  };
}

export async function guardScreenshotPath(filePath: string): Promise<SizeGuardResult> {
  const input = readFileSync(filePath);
  const { buffer, result } = await guardScreenshotBuffer(input);
  if (result.resized) {
    writeFileSync(filePath, buffer);
  }
  return result;
}

export const SCREENSHOT_MAX_DIMENSION_PX = MAX_DIMENSION_PX;
