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
1. App loads → PlaceRateContext restores persona from localStorage
2. PersonaSelector modal does NOT appear
3. User lands directly on Projects page (or last visited tab)

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

- **No changes needed** to PlaceRateContext — persona is already persisted to localStorage
- The `setPersona()` function already saves to localStorage
- The context initializes from localStorage on app load

### Modal Behavior

- PersonaSelector is already a full-screen modal (position: fixed, inset: 0, z-index: 100)
- It blocks interaction with content behind it
- After selection, the onClose handler dismisses it
- The modal's close button (X) is NOT shown on first load (only when persona-changing)

---

## Implementation Details

### Files to Modify
- `src/App.tsx` or `src/components/layout/MainContent.tsx`: Add persona gate check

### Files to Reuse (No Changes)
- `src/components/persona/PersonaSelector.tsx` — existing component
- `src/context/PlaceRateContext.tsx` — existing state + localStorage logic
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
- ✓ Persona is persisted in localStorage (no re-selection on reload)
- ✓ Persona can be changed anytime via header chip
- ✓ Existing PersonaSelector component is reused (no duplication)
- ✓ All existing functionality remains intact
