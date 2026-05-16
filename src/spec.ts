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
 * Read and parse an OpenLook spec file
 * @param specPath Path to the YAML spec file
 * @returns Validated OpenLookSpec object
 * @throws Error if file not found, invalid YAML, or validation fails
 */
export async function loadSpec(specPath: string): Promise<OpenLookSpec> {
  // Resolve the path
  const resolvedPath = path.resolve(specPath);
  
  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Spec file not found: ${specPath}`);
  }
  
  // Read the file
  let fileContent: string;
  try {
    fileContent = fs.readFileSync(resolvedPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read spec file: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Parse YAML
  let rawSpec: unknown;
  try {
    rawSpec = YAML.parse(fileContent);
  } catch (error) {
    throw new Error(`Invalid YAML syntax: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Validate with Zod
  try {
    const spec = OpenLookSpecSchema.parse(rawSpec);
    return spec;
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      throw new Error(`Spec validation failed:\n${formattedErrors}`);
    }
    throw error;
  }
}

/**
 * Format Zod validation errors into a readable message
 */
function formatZodErrors(error: ZodError): string {
  return error.errors
    .map(err => {
      const path = err.path.join('.');
      const message = err.message;
      return `  • ${path}: ${message}`;
    })
    .join('\n');
}

/**
 * Validate a spec object without loading from file
 * Useful for testing or programmatic spec creation
 */
export function validateSpec(spec: unknown): OpenLookSpec {
  try {
    return OpenLookSpecSchema.parse(spec);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      throw new Error(`Spec validation failed:\n${formattedErrors}`);
    }
    throw error;
  }
}

/**
 * Get a summary of a spec for logging/display
 */
export function getSpecSummary(spec: OpenLookSpec): string {
  const lines = [
    `Spec: ${spec.id}`,
    spec.description ? `Description: ${spec.description}` : null,
    `Target: ${spec.target.url}`,
    `Persona: ${spec.persona.type}`,
    `Checks: ${spec.checks.length} (${spec.checks.filter(c => c.priority === 'critical').length} critical)`,
    `Viewport: ${spec.run_config.viewport.width}x${spec.run_config.viewport.height}`,
    `Device: ${spec.run_config.device}`,
  ].filter(Boolean);
  
  return lines.join('\n');
}

// Made with Bob