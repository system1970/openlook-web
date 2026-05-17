/**
 * OpenLook Spec Parser
 * Reads and validates YAML spec files
 */

import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { OpenLookSpecSchema, type OpenLookSpec } from './types.js';
import { ZodError } from 'zod';

/**
 * Read and parse an OpenLook spec file.
 */
export async function loadSpec(specPath: string): Promise<OpenLookSpec> {
  const resolvedPath = path.resolve(specPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Spec file not found: ${specPath}`);
  }

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(resolvedPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read spec file: ${error instanceof Error ? error.message : String(error)}`);
  }

  let rawSpec: unknown;
  try {
    rawSpec = YAML.parse(fileContent);
  } catch (error) {
    throw new Error(`Invalid YAML syntax: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    return OpenLookSpecSchema.parse(rawSpec);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Spec validation failed:\n${formatZodErrors(error)}`);
    }
    throw error;
  }
}

/**
 * Validate a spec object without loading from file.
 */
export function validateSpec(spec: unknown): OpenLookSpec {
  try {
    return OpenLookSpecSchema.parse(spec);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Spec validation failed:\n${formatZodErrors(error)}`);
    }
    throw error;
  }
}

/**
 * Get a summary of a spec for logging/display.
 */
export function getSpecSummary(spec: OpenLookSpec): string {
  return [
    `Spec: ${spec.id}`,
    `URL: ${spec.url}`,
    `Viewport: ${spec.viewport.width}x${spec.viewport.height}`,
    `Steps: ${spec.steps.length}`,
    `Checks: ${spec.checks.length}`,
  ].join('\n');
}

function formatZodErrors(error: ZodError): string {
  return error.errors
    .map(err => `  - ${err.path.join('.')}: ${err.message}`)
    .join('\n');
}
