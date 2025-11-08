# Context Optimization Guide for Claude Code

## 🚨 Token Conservation Strategies

### **Immediate Actions to Save Context:**

1. **Use Efficient Commands**
   ```bash
   # ✅ Efficient TypeScript checking
   pnpm tsc --noEmit

   # ❌ Expensive full build
   pnpm build
   ```

2. **Target Specific Issues**
   ```
   # ✅ Specific request
   "Fix TypeScript error in components/cookies/CookieConsentBanner.tsx:275"

   # ❌ Broad request
   "Review all cookie components and fix any issues"
   ```

3. **Use File References**
   ```
   # ✅ Direct file reference
   "Update line 45 in lib/validations/cookie-consent.ts"

   # ❌ Requires file reading
   "Find and update the Zod schema validation"
   ```

### **Tool Usage Optimization**

1. **Search Before Reading**
   ```bash
   # ✅ Find exact location first
   Grep: pattern="CookiePreferencesSchema"

   # Then read specific section
   Read: file_path + offset + limit
   ```

2. **Use Glob for File Discovery**
   ```bash
   # ✅ Find files efficiently
   Glob: pattern="**/*cookie*.tsx"

   # ❌ Don't explore randomly
   ```

3. **Batch Related Changes**
   ```
   # ✅ Group related fixes
   "Fix all TypeScript 'any' type errors in cookie components"

   # ❌ Fix one error at a time
   ```

### **Session Management**

1. **Break Large Tasks**
   ```
   # ✅ Session 1: Database migration
   # ✅ Session 2: Component fixes
   # ✅ Session 3: Testing

   # ❌ All in one massive session
   ```

2. **Use TodoWrite Efficiently**
   ```
   # ✅ Track progress, complete immediately
   TodoWrite: mark tasks complete as soon as done

   # ❌ Let todo list grow stale
   ```

3. **Reference Previous Work**
   ```
   # ✅ Reference documentation
   "As documented in docs/COOKIE_CONSENT_DEPLOYMENT.md"

   # ❌ Re-explain everything
   ```

### **Code Quality Practices**

1. **Focused Debugging**
   ```bash
   # ✅ Target specific errors
   pnpm tsc | grep -E "(error TS|Cannot find)"

   # ❌ Read entire error output
   ```

2. **Efficient File Operations**
   ```bash
   # ✅ Use Edit tool for targeted changes
   Edit: old_string -> new_string

   # ❌ Read entire file then Write
   ```

3. **Smart Context Loading**
   ```
   # System auto-loads relevant context for:
   - Stripe/billing topics
   - Architecture discussions
   - Chat bot questions

   # Don't request context that's auto-loaded
   ```

## 📊 Context Usage Analysis

### **High Context Usage:**
- Reading large files (>100 lines)
- Exploratory code reviews
- Multiple file reads in sequence
- Full build processes
- Comprehensive testing

### **Low Context Usage:**
- Targeted TypeScript fixes
- Specific line edits
- Grep/Glob searches
- Direct API calls
- Documentation references

## ⚡ Quick Reference Commands

### **TypeScript Issues:**
```bash
# Check compilation
pnpm tsc --noEmit

# Find specific errors
pnpm tsc 2>&1 | grep "error TS"
```

### **Database Operations:**
```bash
# Run migrations efficiently
psql "$DATABASE_URL" -f migration.sql

# Check table existence
psql "$DATABASE_URL" -c "\dt pattern"
```

### **File Management:**
```bash
# Find files
Glob: pattern="**/*.tsx"

# Search content
Grep: pattern="specific_function" output_mode="files_with_matches"

# Edit targeted
Edit: specific old_string -> new_string
```

## 🎯 Session Optimization Examples

### **❌ High Context Session:**
```
User: "Review the entire cookie consent system and make it better"
Assistant: *Reads 15+ files, analyzes everything, uses 70% context*
```

### **✅ Low Context Session:**
```
User: "Fix TypeScript error: Property 'ip' does not exist on type 'NextRequest'"
Assistant: *Uses Grep to find issue, makes targeted Edit, uses 10% context*
```

## 📋 Pre-Session Checklist

Before starting a session:

1. **Define Specific Goals**
   - What exactly needs to be fixed/built?
   - Which files are involved?
   - What's the expected outcome?

2. **Check Documentation First**
   - Is this already documented?
   - Are there existing patterns to follow?
   - Can you reference previous work?

3. **Use Efficient Commands**
   - Start with Grep/Glob to locate issues
   - Use `pnpm tsc` for TypeScript checks
   - Target specific files/functions

4. **Plan Session Scope**
   - Break large tasks into smaller sessions
   - Focus on one component/feature at a time
   - Complete tasks immediately

## 🚀 Emergency Context Saving

If context is running low mid-session:

1. **Complete Current Task**
   - Finish the immediate fix
   - Mark todos as complete
   - Save progress

2. **Document State**
   - Update CLAUDE.md with progress
   - Note any pending issues
   - Reference file locations

3. **Start Fresh Session**
   - Use specific task requests
   - Reference documentation
   - Continue from documented state

---

## Summary: Save 60-80% Context

By following these practices, you can typically save 60-80% of your context usage while maintaining the same code quality and progress speed. Focus on specific, targeted requests and use the efficient tools and commands listed above.