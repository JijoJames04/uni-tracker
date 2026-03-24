# 🤝 Contributing to UniTracker

## 📋 Git Workflow Rules

### Branch Naming Convention
```
feature/F{ID}-{short-description}   → New features
bugfix/{short-description}           → Bug fixes
hotfix/{short-description}           → Urgent production fixes
chore/{short-description}            → Config, CI/CD changes
docs/{short-description}             → Documentation updates
```

**Examples:**
- `feature/F03-official-links-parsing`
- `feature/F18-blocked-account-calculator`
- `bugfix/scraper-timeout-fix`

### Commit Message Convention (Conventional Commits)
```
type(scope): description

feat(scraper): add official LinkedIn/Instagram link parsing
fix(prompt): handle missing optional fields gracefully
chore(ci): add security scanning to pipeline
docs(readme): update setup instructions
refactor(api): extract currency conversion to utility
style(dashboard): improve card spacing on mobile
test(prompt): add unit tests for LOR generator
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`, `perf`, `build`, `ci`

---

## 🔄 Feature Development Workflow

### 1. Before Starting Any Feature
```bash
# Always pull latest changes first
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/F{ID}-{name}
```

### 2. During Development
```bash
# Make atomic, focused commits
git add <specific-files>
git commit -m "feat(scope): implement specific change"

# Regularly sync with main
git fetch origin
git rebase origin/main
```

### 3. Before Pushing
```bash
# ALWAYS pull before push
git pull origin main --rebase

# Verify build passes
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# Push feature branch
git push origin feature/F{ID}-{name}
```

### 4. After Merge
```bash
# Update progress.md: change feature status to ✅ 
# Delete feature branch locally
git branch -d feature/F{ID}-{name}
```

---

## ✅ Progress Tracking

After implementing a feature:
1. Update `progress.md` — change status from 🆕 to ✅
2. Record date of completion
3. Add notes about what was implemented
4. Commit progress update as part of the feature branch

---

## 🚫 Rules

1. **Never push directly to `main`** — always use feature branches + PRs
2. **Never force-push to `main`**
3. **Always `git pull` before `git push`**
4. **One feature per branch** — don't mix unrelated changes
5. **Keep commits atomic** — one logical change per commit
6. **Update progress.md** with every feature completion
7. **No secrets in code** — use environment variables
8. **No build artifacts in git** — check `.gitignore`
