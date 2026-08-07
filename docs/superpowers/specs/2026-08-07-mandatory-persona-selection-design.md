# Mandatory Persona Selection on App Load

**Goal:** Ensure every user selects a persona (Developer, Council, or Community) before accessing any app content. Persona selection is a mandatory gate on first load, but changeable anytime thereafter.

**Architecture:** Modal guard pattern that blocks the entire app UI until a persona is selected. Reuses the existing PersonaSelector component and PlaceRateContext state, with localStorage persistence.

**Tech Stack:** React 18, TypeScript, PlaceRateContext, existing PersonaSelector component

## Global Constraints

- Must use existing PersonaSelector modal component (no new component creation)
- Must preserve localStorage persistence (already implemented in PlaceRateContext)
- Must not break existing persona-change functionality via header chip
- After selection, user lands on Projects page
- Modal must be blocking (z-index: 100, inset: 0, position: fixed)

---

## User Flow

### First Load (No Persona)
1. App loads → PlaceRateContext checks localStorage for saved persona
2. If no persona exists → PersonaSelector modal renders as a blocking overlay
3. User cannot interact with any other UI
4. User clicks a persona card → persona is saved to state + localStorage
5. Modal dismisses → Projects page displays

### Subsequent Loads (Persona Saved)

**Revised 2026-08-07 (second revision)** — at the user's request, the selector now appears on *every* page load, not just the first. The original behaviour below is superseded.

1. App loads → PlaceRateContext restores the saved persona from localStorage
2. PersonaSelector modal appears again, with the previously chosen persona pre-highlighted
3. User confirms (or switches) → modal dismisses → Projects page displays

The saved persona is no longer a reason to skip the gate; it only pre-selects a card. The gate is driven by `personaConfirmed`, a session-scoped flag that is deliberately **not** persisted and resets to `false` on every load.

~~1. App loads → PlaceRateContext restores persona from localStorage~~
~~2. PersonaSelector modal does NOT appear~~
~~3. User lands directly on Projects page (or last visited tab)~~

### Changing Persona Anytime
- User clicks persona chip in header (existing behavior)
- PersonaSelector modal opens
- User can switch to a different persona
- New selection saves to state + localStorage immediately

---

## Technical Approach

### Component Modification

**File:** `src/components/layout/MainContent.tsx` or `src/App.tsx`

At the top of the render logic, add a gate:

```
if (!persona) {
  return <PersonaSelector onClose={() => setPersona(...)} />
}
```

This ensures PersonaSelector is the only thing rendered until a persona is set.

### State & Persistence

**Revised 2026-08-07** — the original spec said "no changes needed" to PlaceRateContext. That was wrong. The context defaulted `persona` to `'developer'`, so `!persona` was never true and the gate could never fire. Two context changes are required:

- Widen `persona` to `string | null` and drop the `'developer'` default, so "not yet chosen" is representable
- Initialise `persona` from localStorage **synchronously** (lazy `useState` initialiser), not in a mount effect — otherwise the first render always has `persona === null` and the selector flashes on every reload for users who already chose one
- `activePersonaConfig` falls back to the developer config while `persona` is null, so no consumer sees `undefined`
- The existing `setPersona()` → localStorage persistence effect is unchanged

### Modal Behavior

- PersonaSelector is already a full-screen modal (position: fixed, inset: 0, z-index: 100)
- It blocks interaction with content behind it
- After selection, the onClose handler dismisses it
- The modal's close button (X) is NOT shown on first load (only when persona-changing)

---

## Implementation Details

### Files to Modify
- `src/App.tsx` or `src/components/layout/MainContent.tsx`: Add persona gate check

- `src/context/PlaceRateContext.tsx`: nullable persona + synchronous localStorage init (see revision above)

### Files to Reuse (No Changes)
- `src/components/persona/PersonaSelector.tsx` — existing component
- `src/components/layout/HeaderNav.tsx` — existing persona chip (no changes)

### Edge Cases

1. **User has persona saved, but refreshes page:**
   - localStorage restores persona
   - Modal does NOT appear
   - App loads normally to Projects

2. **User clears browser data/localStorage:**
   - Persona is lost
   - Modal appears on next load (same as first load)

3. **User changes persona via header chip while on any page:**
   - Modal opens, user selects new persona
   - New persona is saved
   - Page refresh restores new persona (no gate shown again)

---

## Testing

### Unit Tests
- Verify PersonaSelector is rendered when `persona` is null/undefined
- Verify PersonaSelector is NOT rendered when `persona` has a value
- Verify localStorage is read on app init
- Verify `setPersona()` updates both state and localStorage

### Integration Tests
- Fresh load with no localStorage → modal appears
- Fresh load with localStorage persona → modal does NOT appear, Projects page shows
- Click persona in modal → modal closes, Projects page shows
- Refresh page → persona is restored from localStorage
- Click persona chip in header → modal opens, can change persona

---

## Success Criteria

- ✓ Users cannot see any app content without selecting a persona first
- ✓ PersonaSelector modal appears only when no persona is set
- ✓ Modal is blocking (cannot click behind it)
- ✓ After selection, user lands on Projects page
- ✓ Persona selector appears on every page load, with the last choice pre-highlighted (revised — supersedes "no re-selection on reload")
- ✓ Projects and the active project survive reload untouched
- ✓ Persona can be changed anytime via header chip
- ✓ Existing PersonaSelector component is reused (no duplication)
- ✓ All existing functionality remains intact
