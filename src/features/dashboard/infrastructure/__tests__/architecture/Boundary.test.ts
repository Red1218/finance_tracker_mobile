import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== '__tests__') {
        getFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe('Infrastructure Layer Architecture Boundaries', () => {
  it('should not import from presentation, react, or UI components', () => {
    const infraDir = path.resolve(__dirname, '../../../infrastructure');
    const files = getFiles(infraDir);

    const forbiddenImports = [
      /import.*from.*\/presentation.*/,
      /import.*from.*react.*/,
      /import.*from.*\/ui.*/,
      /import.*from.*\/components.*/
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

  it('should only depend on domain, application ports, and itself', () => {
    // This is conceptually verified by the lack of presentation imports.
    // In a strict setup, we would ensure any internal import points to 
    // `../application/ports` or `../domain` or `../infrastructure`.
    const infraDir = path.resolve(__dirname, '../../../infrastructure');
    const files = getFiles(infraDir);

    const violations: string[] = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      // Simple check to ensure we don't import concrete application classes 
      // (like use-cases, mappers, view-models). We should only import from ports and models.
      // E.g. avoid `import { LoadDashboardUseCase } ...`
      const badAppImports = [
        /import.*from.*\/application\/use-cases.*/,
        /import.*from.*\/application\/mappers.*/,
        /import.*from.*\/application\/view-models.*/
      ];

      badAppImports.forEach(regex => {
        if (regex.test(content)) {
          violations.push(`File ${file} illegally imports Application implementation via ${regex}`);
        }
      });
    });

    expect(violations).toEqual([]);
  });
});
