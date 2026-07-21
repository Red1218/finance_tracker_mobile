const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/features/budgets/application/__tests__/*.ts');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/startDate: new Date\(\),\s*endDate: new Date\(\),?/g, "startDate: new Date('2026-06-01T00:00:00Z'), endDate: new Date('2026-06-30T23:59:59Z'),");
  fs.writeFileSync(file, content);
});
