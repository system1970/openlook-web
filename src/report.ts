/**
 * OpenLook Report Generator
 * Creates test reports in JSON and Markdown formats
 */

import * as fs from 'fs';
import * as path from 'path';
import type { OpenLookReport, OpenLookSpec, CheckResult } from './types.js';

/**
 * Generate a report directory with JSON and Markdown files
 * @param spec The test spec that was run
 * @param report The test report data
 * @returns Path to the generated report directory
 */
export async function generateReport(
  spec: OpenLookSpec,
  report: OpenLookReport
): Promise<string> {
  // Create report directory: reports/<spec-id>-<timestamp>/
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportDirName = `${spec.id}-${timestamp}`;
  const reportDir = path.join('reports', reportDirName);
  
  // Ensure reports directory exists
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  
  // Create report subdirectory
  fs.mkdirSync(reportDir, { recursive: true });
  
  // Write JSON report
  const jsonPath = path.join(reportDir, 'report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  
  // Write Markdown report
  const markdownPath = path.join(reportDir, 'report.md');
  const markdown = generateMarkdownReport(spec, report);
  fs.writeFileSync(markdownPath, markdown, 'utf-8');
  
  return reportDir;
}

/**
 * Generate a human-readable Markdown report
 */
function generateMarkdownReport(spec: OpenLookSpec, report: OpenLookReport): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`# OpenLook Test Report`);
  lines.push('');
  lines.push(`**Spec ID:** ${spec.id}`);
  if (spec.description) {
    lines.push(`**Description:** ${spec.description}`);
  }
  lines.push(`**Timestamp:** ${report.timestamp}`);
  lines.push(`**Duration:** ${report.duration_ms}ms`);
  lines.push('');
  
  // Verdict
  const verdictEmoji = report.verdict === 'pass' ? '✅' : report.verdict === 'fail' ? '❌' : '⚠️';
  lines.push(`## ${verdictEmoji} Verdict: ${report.verdict.toUpperCase()}`);
  lines.push('');
  lines.push(report.summary);
  lines.push('');
  
  // Test Configuration
  lines.push(`## Test Configuration`);
  lines.push('');
  lines.push(`- **Target URL:** ${spec.target.url}`);
  lines.push(`- **Persona:** ${spec.persona.type}`);
  lines.push(`- **Context:** ${spec.persona.context}`);
  lines.push(`- **Viewport:** ${spec.run_config.viewport.width}x${spec.run_config.viewport.height}`);
  lines.push(`- **Device:** ${spec.run_config.device}`);
  lines.push(`- **Browser:** ${spec.run_config.browser || 'chromium'}`);
  lines.push('');
  
  // Results Summary
  lines.push(`## Results Summary`);
  lines.push('');
  lines.push(`- **Total Checks:** ${report.checks_total}`);
  lines.push(`- **Passed:** ${report.checks_passed} ✅`);
  lines.push(`- **Failed:** ${report.checks_failed} ❌`);
  lines.push(`- **Pass Rate:** ${Math.round((report.checks_passed / report.checks_total) * 100)}%`);
  lines.push('');
  
  // Failed Checks (if any)
  const failedResults = report.results.filter(r => !r.passed);
  if (failedResults.length > 0) {
    lines.push(`## ❌ Failed Checks`);
    lines.push('');
    
    failedResults.forEach((result, index) => {
      lines.push(`### ${index + 1}. ${result.check.description}`);
      lines.push('');
      lines.push(`**Type:** ${result.check.type}`);
      lines.push(`**Priority:** ${result.check.priority || 'medium'}`);
      if (result.check.selector) {
        lines.push(`**Selector:** \`${result.check.selector}\``);
      }
      lines.push('');
      lines.push(`**Expected:**`);
      lines.push('```');
      lines.push(result.check.expected);
      lines.push('```');
      lines.push('');
      lines.push(`**Reasoning:**`);
      lines.push(result.reasoning);
      lines.push('');
      
      if (result.recommendations && result.recommendations.length > 0) {
        lines.push(`**Recommendations:**`);
        result.recommendations.forEach(rec => {
          lines.push(`- ${rec}`);
        });
        lines.push('');
      }
      
      if (result.evidence && result.evidence.length > 0) {
        lines.push(`**Evidence:**`);
        result.evidence.forEach(ev => {
          lines.push(`- [${ev.type}] ${ev.path}`);
          if (ev.description) {
            lines.push(`  ${ev.description}`);
          }
        });
        lines.push('');
      }
    });
  }
  
  // Passed Checks
  const passedResults = report.results.filter(r => r.passed);
  if (passedResults.length > 0) {
    lines.push(`## ✅ Passed Checks`);
    lines.push('');
    
    passedResults.forEach((result, index) => {
      lines.push(`### ${index + 1}. ${result.check.description}`);
      lines.push('');
      lines.push(`**Type:** ${result.check.type}`);
      if (result.check.selector) {
        lines.push(`**Selector:** \`${result.check.selector}\``);
      }
      lines.push('');
      lines.push(`**Reasoning:** ${result.reasoning}`);
      lines.push('');
    });
  }
  
  // Overall Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    lines.push(`## 💡 Overall Recommendations`);
    lines.push('');
    report.recommendations.forEach(rec => {
      lines.push(`- ${rec}`);
    });
    lines.push('');
  }
  
  // Evidence
  if (report.evidence.length > 0) {
    lines.push(`## 📸 Evidence`);
    lines.push('');
    report.evidence.forEach(ev => {
      lines.push(`- **[${ev.type}]** ${ev.path}`);
      if (ev.description) {
        lines.push(`  ${ev.description}`);
      }
    });
    lines.push('');
  }
  
  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Generated by OpenLook - Visual Unit Testing for User Experience*`);
  
  return lines.join('\n');
}

/**
 * Create a mock report for testing (no real browser/AI)
 */
export function createMockReport(spec: OpenLookSpec): OpenLookReport {
  const startTime = Date.now();
  
  // Mock check results - simulate some passes and some failures
  const results: CheckResult[] = spec.checks.map((check, index) => {
    // Make critical checks pass, alternate others
    const passed = check.priority === 'critical' || index % 2 === 0;
    
    return {
      check,
      passed,
      confidence: 0.85,
      reasoning: passed
        ? `Mock: This check appears to pass based on simulated analysis.`
        : `Mock: This check failed in simulation. The expected state was not observed.`,
      evidence: [],
      recommendations: passed ? undefined : [
        'Consider improving visual hierarchy',
        'Ensure sufficient contrast ratios',
        'Test with real users for validation',
      ],
    };
  });
  
  const checksTotal = results.length;
  const checksPassed = results.filter(r => r.passed).length;
  const checksFailed = checksTotal - checksPassed;
  
  const verdict = checksFailed === 0 ? 'pass' : 'fail';
  
  const endTime = Date.now();
  
  return {
    spec_id: spec.id,
    spec_description: spec.description,
    timestamp: new Date().toISOString(),
    duration_ms: endTime - startTime,
    verdict,
    summary: verdict === 'pass'
      ? `All ${checksTotal} visual checks passed! The user experience meets expectations for a ${spec.persona.type}.`
      : `${checksFailed} of ${checksTotal} checks failed. The user experience needs improvement for a ${spec.persona.type}.`,
    checks_total: checksTotal,
    checks_passed: checksPassed,
    checks_failed: checksFailed,
    results,
    evidence: [],
    recommendations: checksFailed > 0 ? [
      'Focus on failed checks with "critical" priority first',
      'Review visual hierarchy and information architecture',
      'Consider A/B testing proposed changes',
      'Validate fixes with real user testing',
    ] : undefined,
  };
}

// Made with Bob