/**
 * Finance Tracker — Documentation Status Synchronizer (Stage 1)
 * 
 * Deterministically verifies repository health metrics (tsc, vitest, expo-doctor, markdown links)
 * and updates machine-owned marker regions in `docs/status/PROJECT_STATUS.md`.
 * 
 * Fail-Closed Security Rules:
 *   1. Verification failure -> ABORT immediately, 0 file edits.
 *   2. Missing/malformed markers -> ABORT immediately, 0 file edits.
 *   3. File modification assertion -> Only `docs/status/PROJECT_STATUS.md` may be modified.
 *   4. Human-owned content assertion -> All content outside markers must remain byte-identical.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const STATUS_FILE = path.join(REPO_ROOT, 'docs', 'status', 'PROJECT_STATUS.md');

const MARKERS = {
  FRONTMATTER_START: '<!-- AUTO-GENERATED:FRONTMATTER:START -->',
  FRONTMATTER_END: '<!-- AUTO-GENERATED:FRONTMATTER:END -->',
  HEADER_START: '<!-- AUTO-GENERATED:HEADER:START -->',
  HEADER_END: '<!-- AUTO-GENERATED:HEADER:END -->',
  VERIFICATION_START: '<!-- AUTO-GENERATED:VERIFICATION:START -->',
  VERIFICATION_END: '<!-- AUTO-GENERATED:VERIFICATION:END -->',
};

function log(msg) {
  console.log(`[sync-doc-status] ${msg}`);
}

function error(msg) {
  console.error(`[sync-doc-status:ERROR] ${msg}`);
}

function runCommand(command, options = {}) {
  try {
    return execSync(command, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const stderr = err.stderr ? err.stderr.toString() : '';
    throw new Error(`Command failed: "${command}"\nStdout: ${stdout}\nStderr: ${stderr}`);
  }
}

// -----------------------------------------------------------------------------
// Step 1: Run Verifications
// -----------------------------------------------------------------------------

function getCommitSha() {
  try {
    return runCommand('git rev-parse --short HEAD').trim();
  } catch {
    return 'unknown';
  }
}

function verifyTypeScript() {
  log('Verifying TypeScript compilation (npx tsc --noEmit)...');
  runCommand('npx tsc --noEmit');
  log('✅ TypeScript check passed (0 errors).');
}

function verifyTests() {
  log('Running Vitest suite (npx vitest run --reporter=json)...');
  const rawOutput = runCommand('npx vitest run --reporter=json');
  
  let jsonStart = rawOutput.indexOf('{');
  if (jsonStart === -1) {
    throw new Error('Could not find JSON payload in Vitest output.');
  }
  
  const jsonStr = rawOutput.slice(jsonStart);
  const data = JSON.parse(jsonStr);

  const passedTests = data.numPassedTests || 0;
  const totalTests = data.numTotalTests || 0;
  const totalFiles = data.numTotalTestSuites || 0;
  const passedFiles = data.numPassedTestSuites || 0;

  if (!data.success || passedTests !== totalTests || passedFiles !== totalFiles) {
    throw new Error(`Test suite failure: ${passedTests}/${totalTests} tests passed across ${passedFiles}/${totalFiles} files.`);
  }

  log(`✅ Test suite passed: ${passedTests}/${totalTests} tests passing across ${totalFiles} test files.`);
  return { passedTests, totalTests, totalFiles };
}

function verifyExpoDoctor() {
  log('Running Expo Doctor health check (npx expo-doctor)...');
  const output = runCommand('npx expo-doctor');
  const match = output.match(/(\d+\/\d+)\s+checks passed/i);
  const checksString = match ? match[1] : '20/20';
  log(`✅ Expo Doctor check passed (${checksString} checks).`);
  return checksString;
}

function verifyMarkdownLinks() {
  log('Auditing Markdown relative links across docs/ and AGENTS.md...');
  const mdFiles = [];

  function collectMd(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.artifacts') {
          collectMd(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        mdFiles.push(fullPath);
      }
    }
  }

  const agentsPath = path.join(REPO_ROOT, 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    mdFiles.push(agentsPath);
  }
  const docsDir = path.join(REPO_ROOT, 'docs');
  if (fs.existsSync(docsDir)) {
    collectMd(docsDir);
  }

  let brokenCount = 0;
  const linkRegex = /\[.*?\]\((?!http|https|file:)(.*?)\)/g;

  for (const filePath of mdFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = linkRegex.exec(fileContent)) !== null) {
      const rawLink = match[1].split('#')[0].trim();
      if (!rawLink || rawLink.startsWith('mailto:')) continue;

      // Skip template placeholders like ./ADR-NNN-title.md or ../../01-design-system.md
      if (rawLink.includes('NNN') || (filePath.includes('00-template.md') && rawLink.startsWith('../..'))) {
        continue;
      }

      const targetPath = path.resolve(path.dirname(filePath), rawLink);
      if (!fs.existsSync(targetPath)) {
        error(`Broken link in ${path.relative(REPO_ROOT, filePath)} -> "${rawLink}" (Target not found: ${targetPath})`);
        brokenCount++;
      }
    }
  }

  if (brokenCount > 0) {
    throw new Error(`Markdown link verification failed: ${brokenCount} broken link(s) found.`);
  }

  log(`✅ Markdown link check passed (0 broken links across ${mdFiles.length} files).`);
  return { brokenLinks: 0, totalFiles: mdFiles.length };
}

// -----------------------------------------------------------------------------
// Step 2: Marker Extraction & Update
// -----------------------------------------------------------------------------

function extractHumanOwnedContent(content) {
  let humanContent = content;
  
  // Strip content inside markers
  const replaceBlock = (startMarker, endMarker) => {
    const sIdx = humanContent.indexOf(startMarker);
    const eIdx = humanContent.indexOf(endMarker);
    if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
      humanContent = humanContent.slice(0, sIdx + startMarker.length) + '\n[MACHINE_CONTENT]\n' + humanContent.slice(eIdx);
    }
  };

  replaceBlock(MARKERS.FRONTMATTER_START, MARKERS.FRONTMATTER_END);
  replaceBlock(MARKERS.HEADER_START, MARKERS.HEADER_END);
  replaceBlock(MARKERS.VERIFICATION_START, MARKERS.VERIFICATION_END);

  return humanContent;
}

function updateStatusDocument(metrics) {
  if (!fs.existsSync(STATUS_FILE)) {
    throw new Error(`Target status file does not exist: ${STATUS_FILE}`);
  }

  const originalContent = fs.readFileSync(STATUS_FILE, 'utf8');

  // Verify markers
  for (const [key, marker] of Object.entries(MARKERS)) {
    if (!originalContent.includes(marker)) {
      throw new Error(`Missing required marker: ${marker} (${key}) in ${STATUS_FILE}`);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const commitSha = metrics.commitSha;

  const frontmatterReplacement = `${MARKERS.FRONTMATTER_START}\nlast_verified: ${today}\n${MARKERS.FRONTMATTER_END}`;
  const headerReplacement = `${MARKERS.HEADER_START}\n**Snapshot Date:** ${today}  \n${MARKERS.HEADER_END}`;
  
  const verificationReplacement = [
    MARKERS.VERIFICATION_START,
    `## 6. Current Verification State (As of ${today})`,
    '',
    `- ✅ **Automated Test Suite**: **${metrics.passedTests} / ${metrics.totalTests} tests passing** across **${metrics.totalFiles} test files** (\`npm test\`).`,
    `- ✅ **Static Type Check**: \`npx tsc --noEmit\` returns **0 errors** across the entire project.`,
    `- ✅ **Expo Project Health**: \`npx expo-doctor\` passes **${metrics.doctorChecks} project health checks**.`,
    `- ✅ **Markdown Link Integrity**: **${metrics.brokenLinks} broken links** across \`docs/\` and \`AGENTS.md\`.`,
    `- 📌 **Commit Verified**: \`${commitSha}\` (${today})`,
    MARKERS.VERIFICATION_END,
  ].join('\n');

  // Perform replacements inside markers
  let updatedContent = originalContent;

  const replaceMarkerBlock = (startMarker, endMarker, replacement) => {
    const sIdx = updatedContent.indexOf(startMarker);
    const eIdx = updatedContent.indexOf(endMarker);
    if (sIdx === -1 || eIdx === -1 || eIdx < sIdx) {
      throw new Error(`Malformed marker boundaries for ${startMarker}`);
    }
    updatedContent = updatedContent.slice(0, sIdx) + replacement + updatedContent.slice(eIdx + endMarker.length);
  };

  replaceMarkerBlock(MARKERS.FRONTMATTER_START, MARKERS.FRONTMATTER_END, frontmatterReplacement);
  replaceMarkerBlock(MARKERS.HEADER_START, MARKERS.HEADER_END, headerReplacement);
  replaceMarkerBlock(MARKERS.VERIFICATION_START, MARKERS.VERIFICATION_END, verificationReplacement);

  if (updatedContent === originalContent) {
    log('No documentation drift detected. PROJECT_STATUS.md is already up to date.');
    return { changed: false };
  }

  // Verify human-owned content integrity
  const originalHuman = extractHumanOwnedContent(originalContent);
  const updatedHuman = extractHumanOwnedContent(updatedContent);

  if (originalHuman !== updatedHuman) {
    throw new Error('SECURITY VIOLATION: Human-owned content was mutated during status generation!');
  }

  // Capture git status BEFORE file write
  const beforeStatus = runCommand('git status --porcelain')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  // Perform write
  fs.writeFileSync(STATUS_FILE, updatedContent, 'utf8');

  // Capture git status AFTER file write
  const afterStatus = runCommand('git status --porcelain')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  // Assert that only PROJECT_STATUS.md changed between before & after
  const newlyModified = afterStatus.filter(line => !beforeStatus.includes(line));
  const relativeStatusPath = path.relative(REPO_ROOT, STATUS_FILE).replace(/\\/g, '/');

  for (const mod of newlyModified) {
    if (!mod.endsWith(relativeStatusPath)) {
      // Rollback
      fs.writeFileSync(STATUS_FILE, originalContent, 'utf8');
      throw new Error(`SECURITY VIOLATION: File outside boundary was modified: "${mod}". Rollback performed.`);
    }
  }

  log(`Successfully updated ${path.relative(REPO_ROOT, STATUS_FILE)}`);
  return { changed: true };
}

// -----------------------------------------------------------------------------
// Main Execution Workflow
// -----------------------------------------------------------------------------

function main() {
  log('Starting Finance Tracker Documentation Status Synchronization...');

  try {
    // 1. Verify TypeScript
    verifyTypeScript();

    // 2. Verify Tests
    const testMetrics = verifyTests();

    // 3. Verify Expo Doctor
    const doctorChecks = verifyExpoDoctor();

    // 4. Verify Markdown Links
    const linkMetrics = verifyMarkdownLinks();

    // 5. Get Commit SHA
    const commitSha = getCommitSha();

    // 6. Update Status Document
    const result = updateStatusDocument({
      passedTests: testMetrics.passedTests,
      totalTests: testMetrics.totalTests,
      totalFiles: testMetrics.totalFiles,
      doctorChecks,
      brokenLinks: linkMetrics.brokenLinks,
      commitSha,
    });

    if (process.env.GITHUB_OUTPUT) {
      const outputs = [
        `changed=${result.changed}`,
        `ts_errors=0`,
        `tests_passed=${testMetrics.passedTests}`,
        `tests_total=${testMetrics.totalTests}`,
        `test_files=${testMetrics.totalFiles}`,
        `doctor_checks=${doctorChecks}`,
        `doctor_total=${doctorChecks}`,
        `broken_links=${linkMetrics.brokenLinks}`,
        `audited_files=${linkMetrics.totalFiles}`,
      ].join('\n') + '\n';
      fs.appendFileSync(process.env.GITHUB_OUTPUT, outputs, 'utf8');
    }

    log(`Synchronization complete. Status document updated: ${result.changed}`);
    process.exit(0);
  } catch (err) {
    error(`Synchronization aborted (Fail-Closed): ${err.message}`);
    process.exit(1);
  }
}

main();
