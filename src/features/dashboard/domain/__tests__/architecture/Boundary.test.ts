import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== '__tests__') { // Ignore test files for architectural boundaries if desired, but good to check them too. We will check all.
        getFilesRecursively(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe('Domain Architecture Boundaries', () => {
  it('should not import from application, infrastructure, presentation, or shared ui', () => {
    const domainPath = path.resolve(__dirname, '../../');
    const domainFiles = getFilesRecursively(domainPath);

    const forbiddenImports = [
      '/application',
      '/infrastructure',
      '/presentation',
      '/shared',
      '../../application',
      '../../infrastructure',
      '../../presentation',
      '../../shared',
      '../application',
      '../infrastructure',
      '../presentation',
      '../shared'
    ];

    const violations: string[] = [];

    for (const file of domainFiles) {
      // Don't check the boundary test itself
      if (file.endsWith('Boundary.test.ts')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      
      // Match import statements
      const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        for (const forbidden of forbiddenImports) {
          if (importPath.includes(forbidden)) {
            violations.push(`${file}: Imports forbidden module "${importPath}"`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
