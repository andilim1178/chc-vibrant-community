# Mandatory Persona Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every user must select a persona before accessing any app content. The persona selection modal becomes a mandatory gate on app load when no persona is set in localStorage.

**Architecture:** Add a persona gate check in MainContent that renders PersonaSelector as a blocking overlay if no persona exists. Reuses existing PersonaSelector component and PlaceRateContext state, leveraging localStorage persistence that's already implemented.

**Tech Stack:** React 18, TypeScript, PlaceRateContext, PersonaSelector component

## Global Constraints

- Must use existing PersonaSelector modal component (no new component creation)
- Must preserve localStorage persistence (already implemented in PlaceRateContext)
- Must not break existing persona-change functionality via header chip
- After selection, user lands on Projects page
- Modal must be blocking (position: fixed, inset: 0, z-index: 100)
- No changes to PlaceRateContext required — persona persistence already works

---

## File Structure

**Modified:**
- `src/components/layout/MainContent.tsx` — Add persona gate check at component render entry point

**Reused (no changes):**
- `src/context/PlaceRateContext.tsx` — Persona state and localStorage logic
- `src/components/persona/PersonaSelector.tsx` — Modal component
- `src/components/layout/HeaderNav.tsx` — Header persona chip (no changes)

---

### Task 1: Add Persona Gate in MainContent

**Files:**
- Modify: `src/components/layout/MainContent.tsx` (at top of component render)

**Interfaces:**
- Consumes: `persona` and `setPersona` from `usePlaceRate()` context
- Produces: PersonaSelector modal renders as blocking overlay when `persona` is undefined

- [ ] **Step 1: Read current MainContent.tsx to understand structure**

Run: `cat src/components/layout/MainContent.tsx | head -100`

Expected: See the component structure, where `const MainContent: React.FC = () => {` is defined and the return statement

- [ ] **Step 2: Identify the exact location to add gate check**

Look for the return statement in MainContent (should be around line 52). The gate should be added right after variable declarations and before the main JSX return.

- [ ] **Step 3: Add persona gate check**

Edit `src/components/layout/MainContent.tsx`. After the line `const totalScore = ...`, add this gate:

```typescript
// Gate: require persona selection before showing app content
if (!persona) {
  return <PersonaSelector onClose={() => setPersona(persona || '')} />;
}
```

Wait, that's wrong. Let me reconsider — when PersonaSelector closes, it calls `onClose()`. But in the current code, PersonaSelector is shown via `showPersonaModal` state and dismissed by calling `setShowPersonaModal(false)`.

Actually, looking at PersonaSelector.tsx, the `onClose` prop is what's called when the user selects a persona. The component itself handles the selection internally via `setPersona(key)` then `onClose()`.

So the gate should be:

```typescript
// Gate: require persona selection before showing app content
if (!persona) {
  return <PersonaSelector onClose={() => {}} />;
}
```

Since PersonaSelector calls `setPersona()` internally and then calls `onClose()`, we just need an empty onClose handler. The component will update context, causing a re-render where persona is now set, and the gate will pass.

Actually, let me check the current PersonaSelector code... Looking at the component:

```tsx
onClick={() => {
  setPersona(key);
  onClose();
}}
```

Yes, it calls setPersona first, then onClose. So the onClose just needs to exist and can be empty.

Edit the file:

```typescript
const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, activeProject, createNewProject, template, persona, setPersona } = usePlaceRate();
  // ... other state declarations ...

  // Gate: require persona selection before showing app content
  if (!persona) {
    return <PersonaSelector onClose={() => {}} />;
  }

  const totalScore = activeProject ? calculateProjectScore(activeProject) : 0;
  // ... rest of component ...
```

- [ ] **Step 4: Verify the edit looks correct**

Run: `cat src/components/layout/MainContent.tsx | head -50`

Expected: See the new gate check after the usePlaceRate destructuring and before totalScore calculation

- [ ] **Step 5: Test the change in browser**

Open the app in browser at http://localhost:5177

Current state: You should see the Projects page because persona is already saved in localStorage.

To test the gate:
1. Open DevTools → Application → Local Storage → Remove the persona entry
2. Refresh the page
3. Expected: PersonaSelector modal appears, blocking all content
4. Click "Developer" persona
5. Expected: Modal dismisses, Projects page appears

- [ ] **Step 6: Commit the changes**

```bash
git add src/components/layout/MainContent.tsx
git commit -m "feat: add mandatory persona selection gate on app load

Render PersonaSelector modal as a blocking overlay if no persona is set.
Users must select Developer, Council, or Community before accessing app content.
After selection, context updates and gate passes, showing normal app UI.
Persona persists in localStorage (no re-selection on reload)."
```

---

### Task 2: Verify Modal Behavior and Edge Cases

**Files:**
- No code changes; testing only
- Affected: `src/components/layout/MainContent.tsx` (already modified in Task 1)

**Interfaces:**
- Consumes: Browser localStorage, browser reload, user interactions
- Produces: Verified behavior under all edge cases

- [ ] **Step 1: Test first load with no persona (fresh browser)**

Steps:
1. Open DevTools → Application → Local Storage
2. Delete all entries for localhost:5177
3. Close DevTools
4. Refresh page (Cmd+R or Ctrl+R)

Expected:
- PersonaSelector modal appears immediately
- Modal blocks all background content
- Cannot click behind modal (z-index works)
- Buttons are clickable

- [ ] **Step 2: Test persona selection**

Steps:
1. Click "Developer" card in PersonaSelector

Expected:
- Modal dismisses
- Projects page appears
- Header shows "Developer" persona chip

- [ ] **Step 3: Test localStorage persistence**

Steps:
1. Refresh page (Cmd+R or Ctrl+R)

Expected:
- PersonaSelector modal does NOT appear
- Projects page loads directly
- Persona chip still shows "Developer"

- [ ] **Step 4: Test persona switching via header chip**

Steps:
1. Click the persona chip ("Developer") in header

Expected:
- PersonaSelector modal appears (now with close button visible)
- Can select a different persona (e.g., "Council")
- Modal closes
- Header updates to show "Council"
- Refresh page → persona is still "Council"

- [ ] **Step 5: Test localStorage clearing again**

Steps:
1. Open DevTools → Application → Local Storage
2. Delete persona entry again
3. Close DevTools
4. Refresh page

Expected:
- PersonaSelector modal appears again (same as first load)
- Can select a new persona

- [ ] **Step 6: Verify no errors in console**

Steps:
1. Open DevTools → Console
2. Refresh page multiple times
3. Select different personas

Expected:
- No red error messages
- No warnings about missing props or unmounted components

- [ ] **Step 7: Test Projects page appears correctly**

Steps:
1. After selecting a persona, verify Projects page is visible
2. Click "Elements" tab
3. Click "Setup" tab
4. Verify all pages load correctly with persona already selected

Expected:
- No broken functionality
- All tabs work normally
- Persona persists across tab navigation

- [ ] **Step 8: Commit (if any tweaks were needed)**

If you made any small fixes (e.g., styling, cleanup), commit them:

```bash
git add <any-modified-files>
git commit -m "test: verify mandatory persona selection gate behavior

Tested persona selection flow:
- First load with no localStorage shows modal
- Selection dismisses modal and shows Projects
- Persona persists across page refresh
- Persona can be changed via header chip
- All edge cases work as expected"
```

If no changes were needed, no commit is necessary.

---

## Testing Checklist

Before you're done, verify all these scenarios:

- [ ] Fresh page load (no localStorage) → PersonaSelector modal appears and blocks content
- [ ] Click persona card → Modal closes and Projects page shows
- [ ] Refresh page → Persona is remembered, no modal appears
- [ ] Click persona chip → Modal opens for changing persona
- [ ] Select different persona → Modal closes, new persona persists
- [ ] Console has no errors or warnings
- [ ] All navigation tabs work (Projects, Setup, Elements, Results, Report)
- [ ] Header displays current persona correctly
- [ ] Persona icon in header matches Material Icons

---

## Success Criteria

- ✓ PersonaSelector modal appears as blocking overlay on first load (no persona in localStorage)
- ✓ User cannot interact with any app content until persona is selected
- ✓ Modal dismisses after selection
- ✓ User lands on Projects page after persona selection
- ✓ Persona persists in localStorage
- ✓ Persona selection can be changed anytime via header chip
- ✓ Existing PersonaSelector component is reused (no duplication)
- ✓ No console errors or warnings
- ✓ All existing functionality remains intact
