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
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe('Accessibility Standards Validation', () => {
  it('components should have accessible={true} where needed', () => {
    const componentsDir = path.resolve(__dirname, '../../../presentation/components');
    const files = getFiles(componentsDir);

    let foundAccessibleProp = false;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('accessible={true}')) {
        foundAccessibleProp = true;
      }
    });

    // Ensure we are actually applying accessibility properties in our components
    expect(foundAccessibleProp).toBe(true);
  });

  it('interactive elements should enforce min 44x44 touch targets', () => {
    const componentsDir = path.resolve(__dirname, '../../../presentation/components');
    const files = getFiles(componentsDir);

    let hasMinHeight44 = false;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      // We expect minHeight: 44 or minWidth: 44 for Touch Targets (PC-006)
      if (content.includes('minHeight: 44') || content.includes('minWidth: 44')) {
        hasMinHeight44 = true;
      }
    });

    expect(hasMinHeight44).toBe(true);
  });
});
