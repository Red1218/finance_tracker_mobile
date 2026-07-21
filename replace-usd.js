const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/features/budgets/**/*.test.ts');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/'USD'/g, "'INR'");
  content = content.replace(/"USD"/g, '"INR"');
  fs.writeFileSync(file, content);
});
