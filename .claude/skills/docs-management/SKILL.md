---
name: docs-management
description: Automated documentation management including README updates, version control, changelog generation, and project documentation synchronization. Use when updating documentation, managing releases, or keeping project files synchronized.
---

# Documentation Management

Automated documentation and project file management for maintaining consistent, up-to-date project information.

## Quick Start

**Update all documentation:**
```bash
# This skill will help you systematically update:
# - README.md
# - CHANGELOG.md
# - package.json version
# - API documentation
# - Skills documentation
```

**Generate changelog entry:**
```bash
git log --oneline --since="2 weeks ago" | head -10
# Use output to create structured changelog entries
```

## Core Functions

**Version Management**: See [versioning.md](versioning.md) for release workflows
**README Generation**: See [readme-templates.md](readme-templates.md) for consistent formatting
**Changelog Automation**: See [changelog-patterns.md](changelog-patterns.md) for structured entries
**API Documentation**: See [api-docs.md](api-docs.md) for endpoint documentation

## Documentation Update Workflow

Copy this checklist when updating project documentation:

```
Documentation Update Checklist:
- [ ] Step 1: Update package.json version (semantic versioning)
- [ ] Step 2: Generate changelog entry from git commits
- [ ] Step 3: Update README.md with new features/changes
- [ ] Step 4: Sync API documentation with current routes
- [ ] Step 5: Update CLAUDE.md with new project status
- [ ] Step 6: Review and update Skills documentation
- [ ] Step 7: Update environment variable documentation
- [ ] Step 8: Check all cross-references and links
```

## Automated Updates

### Package.json Synchronization
```typescript
// Update version across all files
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = packageJson.version;

// Update references in:
// - README.md badges
// - Docker files
// - API responses
// - Documentation headers
```

### API Documentation Generation
```typescript
// Auto-generate from route files
const apiRoutes = glob.sync('app/api/**/*.ts');
const endpoints = apiRoutes.map(parseApiRoute);

// Generate markdown documentation
const apiDocs = generateApiDocs(endpoints);
fs.writeFileSync('docs/API.md', apiDocs);
```

### README.md Template
```markdown
# Afilo Digital Marketplace

**Version**: {VERSION} | **Status**: {BUILD_STATUS} | **Coverage**: {TEST_COVERAGE}

## 🚀 Features

- ✅ **Payments**: Stripe integration with adaptive checkout
- ✅ **AI Chat**: Enterprise chat bot with knowledge base
- ✅ **Products**: Digital marketplace with licensing
- ✅ **Auth**: Clerk authentication with role management

## 📊 Project Stats

- **API Routes**: {API_COUNT} endpoints
- **Database Tables**: {TABLE_COUNT} tables
- **Components**: {COMPONENT_COUNT} React components
- **Skills**: {SKILLS_COUNT} Claude Code skills

## 🛠 Quick Start

{INSTALLATION_INSTRUCTIONS}

## 📈 Performance

- **Lighthouse Score**: {LIGHTHOUSE_SCORE}%
- **Core Web Vitals**: LCP {LCP}ms | FCP {FCP}ms | CLS {CLS}
```

## Changelog Generation

### Commit Classification
```bash
# Classify commits by type
git log --oneline --since="last tag" | grep -E "^[a-f0-9]+ (feat|fix|docs|style|refactor|test|chore):"

# Generate structured changelog
- feat: New adaptive checkout service
- fix: Resolve chat bot context loading
- docs: Update API documentation
- refactor: Optimize database queries
```

### Changelog Template
```markdown
## [1.2.0] - 2024-01-27

### ✨ Added
- Enterprise chat bot with admin dashboard
- Adaptive checkout with currency conversion
- Semantic search for knowledge base

### 🐛 Fixed
- Database connection pooling issues
- Authentication edge cases
- Mobile responsive chat widget

### 🔧 Changed
- Upgraded to Next.js 15.5.4
- Improved Lighthouse scores to >90%
- Enhanced API error handling

### 📚 Documentation
- Added 5 comprehensive Skills
- Updated API endpoint documentation
- Improved setup instructions
```

## Version Management

### Semantic Versioning
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes

### Release Workflow
```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version
npm version minor  # or major/patch

# 3. Update documentation
# (This skill helps with systematic updates)

# 4. Create pull request
# 5. Merge and tag release
git tag v1.2.0
git push origin v1.2.0
```

## Cross-Reference Validation

### Link Checking
```bash
# Check internal links
find . -name "*.md" -exec grep -l "(\.\/" {} \;

# Validate Skills references
grep -r "See \[.*\.md\]" .claude/skills/

# Check API route documentation
grep -r "/api/" docs/ | grep -v "^docs/.*\.md:"
```

### Consistency Validation
- Version numbers across all files
- Feature status (✅ vs 🚧 vs ❌)
- API endpoint counts and descriptions
- Skills activation keywords
- Environment variable documentation

## Automation Scripts

### Documentation Sync Script
```typescript
// scripts/sync-docs.ts
import { updateReadme } from './update-readme';
import { generateChangelog } from './generate-changelog';
import { syncApiDocs } from './sync-api-docs';
import { validateSkills } from './validate-skills';

async function syncAllDocs() {
  console.log('🔄 Syncing documentation...');

  await updateReadme();
  await generateChangelog();
  await syncApiDocs();
  await validateSkills();

  console.log('✅ Documentation sync complete');
}
```

### Validation Checks
```typescript
// Validate documentation completeness
const checks = [
  'README.md exists and is current',
  'CHANGELOG.md has recent entries',
  'API documentation matches routes',
  'Skills have proper frontmatter',
  'Version numbers are consistent',
  'All links are valid'
];
```

## Integration Points

- **CI/CD**: Run documentation checks on pull requests
- **Git Hooks**: Auto-update docs on version changes
- **Skills System**: Keep skills documentation current
- **API Changes**: Auto-detect new/changed endpoints
- **Performance Metrics**: Update benchmarks automatically