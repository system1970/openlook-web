/**
 * OpenLook CLI Runner
 * Command-line interface for running visual tests
 */

import { loadSpec, getSpecSummary } from './spec.js';
import { generateReport, createMockReport } from './report.js';

/**
 * Run OpenLook from the command line
 */
export async function runCLI(args: string[]): Promise<void> {
  // Parse arguments
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }
  
  const specPath = args[0];
  
  console.error('🔍 OpenLook - Visual Unit Testing for User Experience');
  console.error('');
  
  try {
    // Load and validate spec
    console.error('📄 Loading spec:', specPath);
    const spec = await loadSpec(specPath);
    console.error('✅ Spec loaded and validated');
    console.error('');
    
    // Print spec summary
    console.error(getSpecSummary(spec));
    console.error('');
    
    // Run test (mock for now)
    console.error('🧪 Running visual tests...');
    console.error('⚠️  Note: Using mock data (no real browser/AI yet)');
    console.error('');
    
    const report = createMockReport(spec);
    
    // Generate report
    console.error('📊 Generating report...');
    const reportDir = await generateReport(spec, report);
    console.error('');
    
    // Print results
    const verdictEmoji = report.verdict === 'pass' ? '✅' : report.verdict === 'fail' ? '❌' : '⚠️';
    console.error(`${verdictEmoji} Verdict: ${report.verdict.toUpperCase()}`);
    console.error('');
    console.error(`Results: ${report.checks_passed}/${report.checks_total} checks passed`);
    console.error('');
    console.error(`📁 Report saved to: ${reportDir}/`);
    console.error(`   - report.json (structured data)`);
    console.error(`   - report.md (human-readable)`);
    console.error('');
    
    // Exit with appropriate code
    process.exit(report.verdict === 'pass' ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    console.error('');
    process.exit(1);
  }
}

/**
 * Print CLI usage information
 */
function printUsage(): void {
  console.error('Usage: openlook <spec-file.yaml>');
  console.error('');
  console.error('Example:');
  console.error('  openlook examples/openlook.first-run.yaml');
  console.error('');
  console.error('Options:');
  console.error('  <spec-file.yaml>  Path to OpenLook spec file');
  console.error('');
  console.error('For more information, see: https://github.com/yourusername/openlook');
}

// Made with Bob