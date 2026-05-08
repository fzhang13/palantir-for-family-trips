# Code Quality Setup

This project uses automated code quality tools to maintain professional standards.

## Tools Configured

### 1. **ESLint** - Code Linting
- **Config**: [eslint.config.js](eslint.config.js)
- **Parser**: TypeScript ESLint
- **Rules**: React + TypeScript best practices

**Run manually:**
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### 2. **Prettier** - Code Formatting
- **Config**: [.prettierrc](.prettierrc)
- **Ignores**: [.prettierignore](.prettierignore)

**Run manually:**
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### 3. **TypeScript** - Type Checking
- **Config**: [tsconfig.json](tsconfig.json)

**Run manually:**
```bash
npm run type-check    # Check types
```

### 4. **Husky** - Git Hooks
- **Directory**: `.husky/`
- **Pre-commit Hook**: Runs linting and type checking before commits

### 5. **lint-staged** - Staged File Processing
- **Config**: In [package.json](package.json) under `"lint-staged"`
- **Behavior**: Only checks files you're committing (faster)

---

## Pre-Commit Hook

Every commit automatically runs:

1. **ESLint** on staged `.ts` and `.tsx` files
2. **Prettier** to format staged files
3. **TypeScript** type checking on entire codebase

**If any check fails, the commit is blocked.**

### Example Workflow

```bash
# Make changes
vim src/App.tsx

# Stage changes
git add src/App.tsx

# Attempt commit
git commit -m "Update App component"

# Hooks run automatically:
# ✓ ESLint checks App.tsx
# ✓ Prettier formats App.tsx
# ✓ TypeScript checks all files
# ✓ Commit succeeds (or fails if issues found)
```

### Bypassing Hooks (Not Recommended)

In emergencies only:
```bash
git commit --no-verify -m "Emergency fix"
```

**Warning**: This skips all quality checks. Use sparingly.

---

## Validation Before Build

The build process includes validation:

```bash
npm run build
# Runs: tsc --noEmit && eslint && vite build
```

This ensures no broken code gets deployed.

---

## Manual Validation

Run all checks manually:

```bash
npm run validate
# Runs: type-check + lint + test:run
```

This is useful before pushing to ensure everything passes.

---

## IDE Integration

### VS Code

**Recommended Extensions:**
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

**Auto-format on save** (add to `.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### JetBrains (WebStorm, IntelliJ IDEA)

1. Settings → Languages & Frameworks → JavaScript → Prettier
   - Enable "On save"
2. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Enable "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

---

## Common Issues

### 1. **Pre-commit hook not running**

**Solution:**
```bash
# Reinstall hooks
rm -rf .husky
npm run prepare
```

### 2. **ESLint errors blocking commit**

**Solution:**
```bash
# Fix automatically
npm run lint:fix

# Or fix manually, then commit
```

### 3. **Type errors blocking commit**

**Solution:**
```bash
# Check errors
npm run type-check

# Fix errors in code, then commit
```

### 4. **Prettier formatting conflicts**

**Solution:**
```bash
# Let Prettier format everything
npm run format

# Stage changes
git add .

# Commit
git commit -m "Apply formatting"
```

### 5. **"Command not found: husky"**

**Cause:** npm didn't run the `prepare` script.

**Solution:**
```bash
npm run prepare
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| [eslint.config.js](eslint.config.js) | ESLint rules (flat config format for ESLint 9) |
| [.prettierrc](.prettierrc) | Prettier formatting rules |
| [.prettierignore](.prettierignore) | Files Prettier should skip |
| [.husky/pre-commit](.husky/pre-commit) | Pre-commit hook script |
| [tsconfig.json](tsconfig.json) | TypeScript compiler options |

---

## Customizing Rules

### Add/Modify ESLint Rules

Edit [eslint.config.js](eslint.config.js):

```js
rules: {
  // Add custom rule
  'no-console': 'off',  // Allow console.log
  '@typescript-eslint/no-explicit-any': 'warn',  // Warn instead of error
}
```

### Change Prettier Formatting

Edit [.prettierrc](.prettierrc):

```json
{
  "semi": true,        // Add semicolons
  "singleQuote": false // Use double quotes
}
```

### Disable Type Checking in Pre-commit

Edit [.husky/pre-commit](.husky/pre-commit) and remove:
```bash
npm run type-check
```

---

## Best Practices

1. **Run `npm run validate` before pushing**
   - Catches issues before CI/CD
   - Faster iteration

2. **Enable IDE integration**
   - Real-time feedback
   - Auto-fix on save

3. **Don't bypass hooks**
   - Maintains code quality
   - Prevents broken code in git history

4. **Keep configs minimal**
   - Only override rules when necessary
   - Default configs are well-tested

5. **Update dependencies regularly**
   ```bash
   npm update eslint prettier typescript
   ```

---

## CI/CD Integration

### Vercel Build

Pre-commit hooks run locally, but Vercel also runs:
```bash
npm run build
# Includes: tsc --noEmit && eslint
```

If your local commit bypassed hooks, **Vercel will fail the build**.

### GitHub Actions (if added later)

Example workflow:
```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run validate
```

---

## Troubleshooting

### Clear npm cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### Reset git hooks
```bash
rm -rf .git/hooks
npm run prepare
```

### Check hook permissions
```bash
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (executable)

# If not:
chmod +x .husky/pre-commit
```

---

## Summary

✅ **Automatic**: Pre-commit hooks run on every commit  
✅ **Fast**: Only checks staged files (lint-staged)  
✅ **Comprehensive**: ESLint + Prettier + TypeScript  
✅ **Professional**: Industry-standard tools  
✅ **Configurable**: Easy to customize per project needs

For questions or issues, check the tool documentation:
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/lint-staged/lint-staged)
