# Contributing Guidelines

Welcome to the Digital Scrapboard project! This guide helps you contribute effectively.

## 🎯 Before You Start

1. Read [README.md](README.md) for project overview
2. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for code organization
3. Check existing [issues](https://github.com/issues) to avoid duplicates
4. Join the discussion in [discussions](https://github.com/discussions)

## 🛠️ Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/digital-scrapboard.git
cd digital-scrapboard

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Set up development environment
cd frontend
npm install
cp .env.example .env.local
# Fill in your Supabase credentials

# 4. Start development
npm run dev
```

## 📝 Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (no logic change)
- **refactor**: Refactor (no behavior change)
- **test**: Add or update tests
- **chore**: Maintenance tasks

### Examples
```bash
git commit -m "feat(notes): add drag-and-drop support"
git commit -m "fix(auth): resolve verification link expiry"
git commit -m "docs: update local setup instructions"
git commit -m "test(ui): add button component tests"
```

## ✅ Testing Requirements

Before submitting a PR, ensure:

```bash
# Type checking
npm run check

# Linting
npm run lint

# Format check
npm run format -- --check

# All tests pass
npm run test:run
npm run test:e2e

# Build succeeds
npm run build
```

## 📋 Pull Request Process

1. **Create descriptive PR title**
   ```
   feat: Add handwritten note drawing canvas
   ```

2. **Fill PR description** (use template if available)
   ```markdown
   ## Description
   Adds a drawing canvas component for handwritten notes.

   ## Related Issue
   Closes #42

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested locally
   - [ ] Added unit tests
   - [ ] Added E2E tests
   
   ## Screenshots (if applicable)
   ![Screenshot](url)
   ```

3. **Link related issues**
   ```markdown
   Fixes #42
   Relates to #43
   ```

4. **Wait for review**
   - Address feedback promptly
   - Keep commits clean (rebase if needed)
   - Update PR description if scope changes

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// Place in: frontend/tests/unit/
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    expect(true).toBe(true);
  });
});
```

### E2E Tests
```typescript
// Place in: frontend/tests/e2e/
import { test, expect } from '@playwright/test';

test('user can create a note', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('button:has-text("Add Note")');
  await expect(page.locator('.note')).toBeVisible();
});
```

## 📚 Documentation

### For New Features
- Add JSDoc comments to functions
- Update relevant README sections
- Add examples to documentation
- Include TypeScript types

### For Bugs
- Explain the issue clearly
- Include reproduction steps
- Show expected vs actual behavior

## 🐛 Reporting Issues

### Bug Reports
Include:
- Reproduction steps
- Expected behavior
- Actual behavior
- Environment (OS, browser, Node version)
- Screenshots/videos if helpful

### Feature Requests
Include:
- Use case
- Proposed solution
- Alternative approaches considered
- Any implementation details

## 💡 Code Review Tips

- Keep PRs reasonably sized (<500 lines)
- Test your own code first
- Write clear commit messages
- Respond to review comments promptly
- Don't take feedback personally!

## 🚀 When Your PR Gets Merged

- Your contribution is part of the project! 🎉
- You'll be added to contributors list
- Your code will be in production eventually
- Feel free to tackle another issue

## ❓ Questions?

- Check [discussions](https://github.com/discussions)
- Ask in pull request comments
- Email maintainers

---

**Thank you for contributing! 💜**
