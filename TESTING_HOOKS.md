# Testing Pre-Commit Hooks

## ✅ Your Hooks Are Working!

The pre-commit hooks are successfully configured and will run automatically on every commit.

## What You'll See When Committing

### Successful Commit (All Checks Pass)

```bash
git add src/App.tsx
git commit -m "feat: update component"

# You'll see minimal output:
✓ Preparing lint-staged...
✓ Running tasks for staged files...
✓ Applying modifications from tasks...
✓ Type checking...

[master abc1234] feat: update component
 1 file changed, 5 insertions(+), 2 deletions(-)
```

### Failed Commit (Checks Find Issues)

```bash
git add src/BadComponent.tsx
git commit -m "feat: add bad component"

# You'll see detailed errors:
✖ eslint --fix --max-warnings 0:

src/BadComponent.tsx
  5:9  warning  'unusedVariable' is assigned a value but never used
  6:3  warning  Unexpected console statement

✖ 2 problems (0 errors, 2 warnings)
ESLint found too many warnings (maximum: 0).

# Type checking:
src/BadComponent.tsx(5,9): error TS6133: 'unusedVariable' is declared but never read.

# COMMIT BLOCKED ❌
# Fix the issues and try again
```

## What Gets Checked

### 1. **lint-staged** (Fast - Only Staged Files)

- ✅ Runs ESLint on your changed `.ts` and `.tsx` files
- ✅ Runs Prettier to format your files
- ✅ Auto-fixes what it can
- ⚠️ Blocks commit if issues remain

### 2. **TypeScript Type Checking** (Full Project)

- ✅ Checks all files for type errors
- ⚠️ Blocks commit if type errors exist

## Common Scenarios

### Scenario 1: Auto-Fixable Issues

```bash
# You write code with formatting issues
git add src/Component.tsx
git commit -m "update"

# Hook runs:
✓ Prettier formats your file automatically
✓ ESLint fixes auto-fixable issues
✓ Commit succeeds with fixed code
```

### Scenario 2: Non-Fixable Issues

```bash
# You have unused variables or type errors
git add src/Component.tsx
git commit -m "update"

# Hook runs:
✖ ESLint finds issues it can't auto-fix
✖ TypeScript finds type errors
✖ Commit is BLOCKED

# Fix manually:
npm run lint:fix     # Try auto-fix again
# Fix remaining issues in your editor
git add src/Component.tsx
git commit -m "update"  # Try again
```

### Scenario 3: Emergency Bypass (Not Recommended)

```bash
# In emergencies only - skips ALL checks
git commit --no-verify -m "emergency fix"

# ⚠️ WARNING: This bypasses all quality checks
# Only use when absolutely necessary
```

## Quick Fixes

### Auto-fix Linting Issues

```bash
npm run lint:fix
```

### Auto-fix Formatting

```bash
npm run format
```

### Check Type Errors

```bash
npm run type-check
```

### Run All Checks Manually

```bash
npm run validate
```

## Why You Might Not See Output

**RTK (Rust Token Killer) may filter the output**, making it seem like nothing happened. The hooks ARE running, but the output is being minimized to save tokens.

### To Verify Hooks Are Running:

1. **Check git config:**

   ```bash
   git config core.hooksPath
   # Should output: .husky
   ```

2. **Test with intentional error:**

   ```bash
   # Add console.log to a file
   echo "console.log('test')" >> src/App.tsx
   git add src/App.tsx
   git commit -m "test"

   # Should fail with: "Unexpected console statement"
   ```

3. **Run hook manually:**
   ```bash
   ./.husky/pre-commit
   # Shows what the hook checks
   ```

## Performance

- **Fast**: Only checks files you're committing (via lint-staged)
- **Thorough**: Runs full type check to catch cross-file issues
- **Efficient**: Typically adds 1-5 seconds to commit time

## Troubleshooting

### "Hooks not running"

**Fix:**

```bash
git config core.hooksPath .husky
chmod +x .husky/pre-commit
```

### "Hook failing but I can't see why"

**Run checks manually:**

```bash
npm run lint
npm run type-check
```

### "Hook running on wrong files"

**Check lint-staged config in package.json:**

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

### "Want to skip hooks for one commit"

**Not recommended, but:**

```bash
git commit --no-verify -m "message"
```

## Summary

✅ Hooks are working correctly  
✅ They run automatically on every commit  
✅ They block commits with errors/warnings  
✅ They auto-fix what they can  
✅ They ensure code quality before it enters git history

**You're all set! The hooks will protect your codebase from now on.**
