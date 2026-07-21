const fs = require('fs');
let content = fs.readFileSync('src/features/budgets/infrastructure/repositories/SupabaseBudgetRepository.ts', 'utf-8');
content = content.replace(/new RepositoryError\('([^']+)', (err|error)\)/g, "new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', '$1', undefined, $2)");
content = content.replace(/new RepositoryError\('([^']+)', (err as Error)\)/g, "new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', '$1', undefined, err as Error)");
fs.writeFileSync('src/features/budgets/infrastructure/repositories/SupabaseBudgetRepository.ts', content);
