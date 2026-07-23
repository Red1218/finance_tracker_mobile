import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== '__tests__') { // skip tests
        getFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe('Application Layer Architecture Boundaries', () => {
  it('should not import from infrastructure, presentation, or shared layers', () => {
    const appDir = path.resolve(__dirname, '../../../application');
    const files = getFiles(appDir);

    // Matches imports that try to reach infrastructure, presentation, etc.
    const forbiddenImports = [
      /import.*from.*\/infrastructure.*/,
      /import.*from.*\/presentation.*/,
      /import.*from.*\/shared.*/,
      /import.*from.*react.*/, // No UI frameworks
      /import.*from.*typeorm.*/, // No DB frameworks
      /import.*from.*axios.*/ // No HTTP frameworks
    ];

    const violations: string[] = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      forbiddenImports.forEach(regex => {
        if (regex.test(content)) {
          violations.push(`File ${file} violates architecture boundary by matching ${regex}`);
        }
      });
    });

    expect(violations).toEqual([]);
  });
});
