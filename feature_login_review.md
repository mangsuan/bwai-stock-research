# Phase 1 — Authentication Review Report

**Date:** 2026-06-26
**Scope:** Login (`/login`) and Register (`/register`) pages — Next.js frontend

---

## 1. Current State Summary

### Login Page (`frontend/src/app/login/page.tsx`)
- **Layout:** Centered card, max-width 320px, vertical stack
- **Header:** "Sign In" title (h1, 4xl) + "Welcome back to BWAI" subtitle
- **OAuth:** Google + Facebook buttons (fetched dynamically from `/auth/providers`)
- **Divider:** "or" separator between OAuth and form
- **Form:** Username input + Password input + "Sign In" button
- **Footer:** "Don't have an account? Create one" link
- **Error handling:** Red banner at top on failure
- **Loading state:** Button text changes to "Signing in..."

### Register Page (`frontend/src/app/register/page.tsx`)
- **Layout:** Identical structure to login
- **Header:** "Create Account" title + "Start your research journey" subtitle
- **OAuth:** Same Google + Facebook buttons
- **Form:** Username + Email + Password inputs + "Create Account" button
- **Footer:** "Already have an account? Sign in" link
- **Error handling:** Same red banner pattern
- **Loading state:** Button text changes to "Creating account..."

### Shared Infrastructure
- **AuthContext:** JWT-based, stores token in localStorage, provides `login()` / `register()` / `logout()`
- **ThemeContext:** Light/dark mode synced from user profile or localStorage
- **CSS Variables:** Defined in `globals.css` for light/dark themes
- **Design Tokens:** Apple-inspired — accent `#0071e3`, rounded-2xl inputs, pill buttons (`btn-apple`)

---

## 2. UI Issues

| # | Issue | Severity | Page | Description |
|---|-------|----------|------|-------------|
| UI-1 | **No visible labels on inputs** | High | Both | Inputs use only `placeholder` text — disappears on focus. Users lose context about what they're filling in. |
| UI-2 | **No "Remember Me" checkbox** | Medium | Login | Feature not implemented. Users must re-type username every visit. |
| UI-3 | **No show/hide password toggle** | High | Both | Password field has no visibility toggle. Users can't verify what they typed. |
| UI-4 | **Hardcoded light-mode colors in error banner** | High | Both | `bg-red-50 border-red-100` — no dark mode variant. Error banner looks broken in dark mode. |
| UI-5 | **Hardcoded light-mode colors on OAuth buttons** | High | Both | `bg-white`, `border-[#d2d2d7]` — Google button is invisible in dark mode. Facebook button uses hardcoded blue. |
| UI-6 | **Hardcoded light-mode divider** | Medium | Both | "or" separator uses `bg-white` for the span background — invisible in dark mode. |
| UI-7 | **No app logo/branding** | Medium | Both | Pages show only text — no logo, no visual identity, no hero element. |
| UI-8 | **No password strength indicator** | High | Register | No visual feedback on password quality. Users don't know requirements until they fail. |
| UI-9 | **No "Confirm Password" field** | Medium | Register | Single password field with no confirmation — easy to make typos. |
| UI-10 | **No terms/privacy checkbox** | Medium | Register | No agreement step before account creation. |
| UI-11 | **No "Forgot Password" link** | Low | Login | Even if backend doesn't support it yet, the absence feels incomplete. (Out of scope — noted only.) |
| UI-12 | **Button styling inconsistency** | Low | Both | Login/Signup use `btn-apple` (pill shape, blue bg) while OAuth buttons use `rounded-2xl` (rounded rectangle). Mixed shape language. |

---

## 3. UX Issues

| # | Issue | Severity | Page | Description |
|---|-------|----------|------|-------------|
| UX-1 | **No inline validation** | High | Both | Validation only happens on form submit (browser default). No real-time feedback on blur. |
| UX-2 | **Generic error messages** | Medium | Both | Backend errors like "Invalid username or password" are shown raw. No guidance on what's wrong. |
| UX-3 | **No duplicate submission prevention** | Medium | Both | Button disables on loading, but if user clicks rapidly before state updates, multiple requests can fire. |
| UX-4 | **Register auto-logs in and redirects to home** | Medium | Register | After registration, user is logged in and sent to `/`. No "check your email" or onboarding step. Works, but feels abrupt. |
| UX-5 | **OAuth buttons disabled without explanation** | Medium | Both | If Google/Facebook aren't configured, buttons are greyed out but show no tooltip or message explaining why. |
| UX-6 | **No keyboard shortcut to submit** | Low | Both | Enter key works (native form behavior), but no visual indication. |
| UX-7 | **No loading skeleton on initial render** | Low | Both | OAuth provider fetch is async — buttons may flash from disabled to enabled. |
| UX-8 | **Redirect to `/` after login** | Low | Both | No "return to previous page" logic. If user was redirected to login from a protected page, they lose context. |

---

## 4. Accessibility Gaps

| # | Issue | Severity | Description |
|---|-------|----------|-------------|
| A-1 | **No `<label>` elements** | High | Inputs use only `placeholder` — no associated `<label>` or `aria-label`. Screen readers have no context for the fields. |
| A-2 | **Error messages not linked to inputs** | Medium | Error banner is a separate div — not connected via `aria-describedby` or `aria-live`. Screen readers won't announce errors when they appear. |
| A-3 | **OAuth buttons have no `aria-label`** | Low | Buttons say "Continue with Google" which is fine visually, but the SVG icon has no `aria-hidden="true"`. |
| A-4 | **Focus management after error** | Medium | After a login error, focus stays on the button. It should move to the error message or the first invalid field. |
| A-5 | **Color-only error indication** | Low | Error state uses only red color. No icon or additional indicator for colorblind users. |
| A-6 | **Contrast in dark mode** | Medium | Hardcoded light-mode colors (see UI-4, UI-5, UI-6) fail WCAG AA contrast in dark mode. |

---

## 5. Performance Concerns

| # | Issue | Severity | Description |
|---|-------|----------|-------------|
| P-1 | **No form memoization** | Low | Every keystroke re-renders the entire form component. Not a real problem at this scale, but could use `useCallback` for handlers. |
| P-2 | **OAuth provider fetch on every mount** | Low | `useEffect` fetches providers on every page load. Could be cached in context or static config. |
| P-3 | **No input debouncing** | Low | Not needed currently (no live validation), but will matter when inline validation is added. |

---

## 6. Mobile Usability Issues

| # | Issue | Severity | Description |
|---|-------|----------|-------------|
| M-1 | **No `autocomplete` attributes** | Medium | Inputs lack `autocomplete="username"` and `autocomplete="current-password"` / `autocomplete="new-password"`. Password managers won't auto-fill correctly. |
| M-2 | **No `inputMode` hints** | Low | Username field could benefit from `inputMode="text"` for mobile keyboard optimization. |
| M-3 | **Touch targets are adequate** | ✅ | Buttons and inputs use `py-4` (16px padding) — meets 48px minimum. |
| M-4 | **No safe area handling** | Low | On devices with notches, the centered layout works fine, but no explicit `safe-area-inset` padding. |

---

## 7. Prioritized Recommendations

### P0 — Must Fix (Blocks usability or is a clear bug)

| # | Fix | Issue(s) |
|---|-----|----------|
| 1 | **Add visible labels to all inputs** | UI-1, A-1 |
| 2 | **Add show/hide password toggle** | UI-3 |
| 3 | **Fix dark mode on all auth elements** | UI-4, UI-5, UI-6, A-6 |
| 4 | **Add inline validation on blur** | UX-1 |
| 5 | **Add `aria-describedby` for errors** | A-2 |

### P1 — Should Fix (Impacts experience significantly)

| # | Fix | Issue(s) |
|---|-----|----------|
| 6 | **Add password strength meter** | UI-8 |
| 7 | **Add "Confirm Password" field** | UI-9 |
| 8 | **Add "Remember Me" checkbox** | UI-2 |
| 9 | **Add `autocomplete` attributes** | M-1 |
| 10 | **Add logo/branding to auth pages** | UI-7 |
| 11 | **Add terms/privacy checkbox** | UI-10 |
| 12 | **Improve error messages with context** | UX-2 |
| 13 | **Add focus management after errors** | A-4 |

### P2 — Nice to Have (Polish)

| # | Fix | Issue(s) |
|---|-----|----------|
| 14 | **Add loading skeleton for OAuth buttons** | UX-7 |
| 15 | **Add tooltip for disabled OAuth buttons** | UX-5 |
| 16 | **Cache OAuth provider list** | P-2 |
| 17 | **Add "return to previous page" after login** | UX-8 |
| 18 | **Add aria-hidden to SVG icons** | A-3 |

---

## 8. Existing Design System Assets (Reusable)

These already exist and should be reused in the redesign:

| Asset | Location | Notes |
|-------|----------|-------|
| CSS Variables | `globals.css` | Light/dark mode colors defined (`--accent`, `--border`, `--card-bg`, etc.) |
| `btn-apple` class | `globals.css` | Pill-shaped blue button with hover/active states |
| `btn-apple-secondary` class | `globals.css` | Outlined pill button |
| `animate-fade-in` class | `globals.css` | Fade-in + slide-up animation |
| `glass` class | `globals.css` | Backdrop blur effect (used in Navbar) |
| `card-hover` class | `globals.css` | Scale + shadow on hover |
| `gradient-text` class | `globals.css` | Gradient text effect |
| `AuthContext` | `contexts/AuthContext.tsx` | `login()`, `register()`, `logout()` — no changes needed |
| `ThemeContext` | `contexts/ThemeContext.tsx` | `theme`, `toggleTheme()` — no changes needed |
| Focus ring style | `globals.css` | `*:focus-visible` — blue outline, 4px, offset 2px |
| Input font style | `globals.css` | 17px, line-height 1.47, letter-spacing -0.022em |

---

## 9. Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/auth/AuthInput.tsx` | **Create** | Reusable text input with label, error, icon |
| `frontend/src/components/auth/PasswordInput.tsx` | **Create** | Password field with show/hide toggle |
| `frontend/src/components/auth/AuthButton.tsx` | **Create** | CTA button with loading/disabled states |
| `frontend/src/components/auth/AuthCard.tsx` | **Create** | Centered card wrapper |
| `frontend/src/components/auth/AuthHeader.tsx` | **Create** | Logo + title + subtitle |
| `frontend/src/app/login/page.tsx` | **Rewrite** | Full redesign using new components |
| `frontend/src/app/register/page.tsx` | **Rewrite** | Full redesign using new components |

**No backend changes required.** All existing endpoints remain as-is.

---

## 10. Verdict

The current auth pages are **functional but minimal**. They work, but lack the polish expected of a fintech platform:

- **No form labels** — accessibility blocker
- **No password toggle** — common UX expectation
- **Broken dark mode** — hardcoded light colors on key elements
- **No inline validation** — users only learn about errors after submit
- **No visual branding** — pages feel generic

The redesign should transform these from "basic form pages" into "premium fintech auth experience" while keeping the existing backend untouched.

---

**Next step:** Phase 2 — Build reusable auth components.
