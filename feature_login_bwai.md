# Authentication Redesign – BWAI Stock Research

Review and completely redesign the Login and Sign Up experience for BWAI Stock Research.

Use the UI/UX principles and design language inspired by:

* Moomoo: https://www.moomoo.com/sg/
* TradingView: https://www.tradingview.com/

Do NOT copy logos, branding assets, copyrighted graphics, illustrations, trademarks, colors, or proprietary content.

Instead, recreate the overall UX quality, visual hierarchy, professionalism, onboarding flow, and fintech-focused user experience.

---

# Scope

## In Scope

* Web (Next.js) Login page redesign
* Web (Next.js) Signup page redesign
* Reusable auth components (AuthInput, PasswordInput, AuthButton, AuthCard, AuthHeader)
* Real-time inline validation
* Password strength meter on signup
* Dark mode support
* Mobile-responsive layout
* Security trust indicators
* Phase 1 review report (current state analysis)

## Out of Scope (Future Phases)

* **Forgot Password** — requires email sending infrastructure and reset token backend (not yet implemented)
* **Apple Sign-In** — requires Apple Developer account and new OAuth provider setup
* **Country / Investor Experience fields** — requires new database columns and backend changes
* **Mobile app (Expo) redesign** — separate phase; web redesign comes first
* **Backend auth changes** — current username-based login remains as-is

## Not Changing

* Backend auth endpoints remain unchanged (`/auth/login` uses username, `/auth/register` uses username + email)
* JWT token flow remains unchanged
* OAuth providers remain Google + Facebook (no new providers)

---

# Product Context

BWAI Stock Research is an AI-powered stock research platform.

Users come here to:

* Discover stocks
* Build watchlists
* Research companies
* Analyze financial data
* Generate AI-powered stock insights
* Track investment opportunities

The authentication experience should immediately communicate:

* Trust
* Professionalism
* Financial intelligence
* Data-driven decision making
* Modern technology
* Security

The user should feel like they are entering a premium investment research platform.

---

# Design Direction

Combine:

### TradingView

Use for:

* Minimalist layout
* Professional typography
* Clean spacing
* Data-focused design
* Modern SaaS appearance

### Moomoo

Use for:

* Friendly onboarding
* Strong CTA buttons
* Mobile-first UX
* Financial product credibility
* Smooth user journey

---

# Phase 1 – Review Existing Authentication

Before implementation, analyze the current state and produce a brief report.

## Review Report Template

### 1. Current State

* Screenshots of current Login and Signup pages (light + dark mode)
* Current validation behavior (when does it trigger? what messages?)
* Current OAuth flow (which providers, where do buttons appear?)
* Current responsive behavior (mobile vs desktop)

### 2. UI Issues

List each issue with severity (High / Medium / Low):

| Issue | Severity | Description |
|-------|----------|-------------|
| ... | High/Med/Low | ... |

### 3. UX Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| ... | High/Med/Low | ... |

### 4. Accessibility Gaps

* Missing labels?
* Contrast issues?
* Keyboard navigation?
* Focus indicators?

### 5. Prioritized Recommendations

| Priority | Change | Reason |
|----------|--------|--------|
| P0 | ... | Must fix — blocks usability |
| P1 | ... | Should fix — impacts experience |
| P2 | ... | Nice to have — polish |

---

# Login Screen Redesign

Create a premium fintech-style login experience.

---

## Header Section

Display:

**Application Logo** — use existing BWAI logo or a simple icon

**Application Name:**
BWAI Stock Research

**Tagline:**
AI-Powered Investment Research

**Optional subtitle:**
Research Smarter. Invest with Confidence.

---

## Hero Section

Create a subtle finance-themed visual area.

Possible elements:

* Market trend line (SVG or CSS animation)
* Candlestick-inspired patterns (abstract, not real chart data)
* AI data visualization (subtle gradient or particle effect)

Requirements:

* Minimal
* Elegant
* Professional
* Non-distracting

No excessive illustrations. No cartoon graphics.

---

## Login Form

**Fields:**

* **Username** (not email — backend expects username)
* **Password**

**Features:**

* Show/Hide Password toggle
* Remember Me checkbox (stores username in localStorage)
* Real-time validation on blur
* Inline validation messages below each field

**Validation rules:**

| Field | Rule | Message |
|-------|------|---------|
| Username | Required, min 3 chars | "Username must be at least 3 characters" |
| Password | Required | "Password is required" |

Validation should occur on blur (after user leaves field), not on every keystroke. Re-validate on submit if there are errors.

---

## Primary CTA

**Button text:** Sign In

Requirements:

* Large touch target (min 48px height)
* Premium gradient or solid background
* Loading state: spinner + disabled, text changes to "Signing in..."
* Disabled state: greyed out when form is invalid or loading
* Error state: button remains visible, error shown above or below

Prevent duplicate submissions — disable button immediately on click.

---

## Secondary Navigation

Display:

Don't have an account? **Create Account**

Link to `/register`. Smooth transition.

---

## Social Login

Display below a divider ("Or continue with"):

* **Continue with Google**
* **Continue with Facebook**

Buttons should match the design system (outlined style, icon + text).

Note: The available providers are fetched dynamically from `/auth/providers`. If a provider is not configured, its button won't appear.

---

## Security Indicators

Display small trust indicators at the bottom:

✓ Secure Authentication
✓ Data Encrypted
✓ Privacy Protected

Use subtle icons (lock, shield) and muted text color. Don't make them prominent — they're background reassurance.

---

# Signup Screen Redesign

Create a frictionless onboarding experience.

---

## Header

**Logo** — same as login

**Application Name** — BWAI Stock Research

**Headline:**
Create Your Investor Account

**Subheadline:**
Build watchlists, research stocks, and unlock AI-powered market insights.

---

## Signup Form

**Fields:**

* **Username** — required, min 3 characters
* **Email Address** — required, valid email format
* **Password** — required, strength rules below
* **Confirm Password** — must match password

**Note:** Country and Investor Experience Level are NOT included in this phase. The backend does not support these fields yet. They may be added in a future profile completion step.

---

## Password Experience

Implement:

* Show/Hide Password toggle (both password fields)
* Password Strength Meter — visual bar that updates live
* Live Password Validation — checklist that ticks off as requirements are met

**Strength requirements:**

| Rule | Label | Icon |
|------|-------|------|
| Min 8 characters | "At least 8 characters" | ✓ / ✗ |
| One uppercase letter | "One uppercase letter" | ✓ / ✗ |
| One number | "One number" | ✓ / ✗ |
| One special character | "One special character" | ✓ / ✗ |

**Strength meter levels:**

* 0 rules met → Red bar, "Weak"
* 1–2 rules met → Orange bar, "Fair"
* 3 rules met → Yellow bar, "Good"
* 4 rules met → Green bar, "Strong"

Password field validates on keystroke (live feedback). Confirm password validates on blur.

---

## Investor Value Section

Display a small benefits card below the form:

**With your account you can:**

✓ Save watchlists
✓ Track favorite stocks
✓ Access AI stock analysis
✓ Receive personalized research

Use subtle card styling with check icons. This reinforces value without being intrusive.

---

## Terms & Privacy

**Checkbox:**
I agree to the Terms of Service and Privacy Policy

* Required before account creation
* "Terms of Service" and "Privacy Policy" are styled as links (can be `#` for now)
* Button is disabled until checkbox is checked

---

## Primary CTA

**Button text:** Create Account

Requirements:

* Loading state: spinner + "Creating account..."
* Disabled state: greyed when form invalid, loading, or terms unchecked
* Validation state: re-validate all fields on click if any are empty
* Success feedback: redirect to login or auto-login after registration

---

## Existing User Navigation

Display:

Already have an account? **Sign In**

Link to `/login`.

---

# Mobile Experience Requirements

The web app is responsive and must work well on mobile browsers.

Implement:

* **Keyboard-aware layout** — form fields scroll into view when focused
* **Responsive breakpoints** — single column on mobile, centered card on desktop
* **Large touch targets** — all buttons and inputs min 48px height
* **Proper input attributes** — `type="text"`, `type="email"`, `type="password"`, `autocomplete`
* **Smooth transitions** — fade-in on page load, subtle hover/focus states
* **Fast interactions** — no layout shift, no janky animations

The experience should feel similar to a premium investment app on mobile.

---

# Dark Mode

Support both:

* Light Mode
* Dark Mode

Use the existing `ThemeContext` from `frontend/src/contexts/ThemeContext.tsx`.

Dark mode requirements:

* **Strong contrast** — text must be clearly readable against backgrounds
* **Consistent palette** — use CSS variables or Tailwind dark: classes
* **Premium appearance** — dark backgrounds with subtle borders, not pure black
* **Form inputs** — dark input backgrounds with visible borders
* **Error states** — error text must be readable in dark mode (use lighter red)

---

# Design System

Create reusable auth-specific components:

| Component | File | Purpose |
|-----------|------|---------|
| `AuthInput` | `frontend/src/components/auth/AuthInput.tsx` | Text input with label, error, icon support |
| `PasswordInput` | `frontend/src/components/auth/PasswordInput.tsx` | Password field with show/hide toggle |
| `AuthButton` | `frontend/src/components/auth/AuthButton.tsx` | Primary CTA button with loading/disabled states |
| `AuthCard` | `frontend/src/components/auth/AuthCard.tsx` | Centered card wrapper for auth forms |
| `AuthHeader` | `frontend/src/components/auth/AuthHeader.tsx` | Logo + title + subtitle section |

All components should:

* Accept `className` prop for overrides
* Support dark mode via Tailwind `dark:` classes
* Use consistent spacing from a shared scale (4px grid)
* Use consistent border-radius (e.g., `rounded-xl` for cards, `rounded-lg` for inputs)

---

# Accessibility

Ensure:

* **Labels** — every input has a visible `<label>` or `aria-label`
* **Screen reader** — form errors announced via `aria-live` or `aria-describedby`
* **Keyboard navigation** — Tab order is logical, Enter submits form
* **Focus indicators** — visible focus ring on all interactive elements
* **WCAG AA contrast** — text-to-background ratio ≥ 4.5:1
* **Touch targets** — min 48×48px for all interactive elements

---

# Acceptance Criteria

The redesign is complete when ALL of the following are true:

| # | Criteria | How to verify |
|---|----------|---------------|
| 1 | Login form validates on blur, shows inline errors | Tab through fields, leave empty, see error messages |
| 2 | Signup password meter updates live as user types | Type in password field, watch strength bar and checklist |
| 3 | Login button shows spinner and disables during API call | Submit login, observe button state |
| 4 | Dark mode is fully functional on both pages | Toggle theme, verify all elements are readable |
| 5 | Pages are responsive on mobile viewport (375px) | Chrome DevTools mobile emulation |
| 6 | OAuth buttons (Google, Facebook) trigger correct flows | Click each button, verify redirect |
| 7 | All form fields have proper labels and autocomplete | Inspect HTML attributes |
| 8 | No console errors on page load or interaction | Open browser console, test both pages |
| 9 | Signup creates account and redirects to login | Fill form, submit, verify redirect |
| 10 | Login with valid credentials redirects to home | Submit login, verify redirect to `/` |

---

# Technical Requirements

* Follow existing Next.js project architecture in `frontend/`
* TypeScript with proper types (no `any`)
* Use Tailwind CSS — no inline styles
* Reuse existing `ThemeContext` and `AuthContext`
* Create reusable components in `frontend/src/components/auth/`
* Maintain clean folder structure
* No new npm dependencies unless absolutely necessary (check if existing deps cover the need)

---

# Deliverables

1. **Authentication review report** — Phase 1 analysis using the template above
2. **UX gap analysis** — prioritized list of current issues
3. **UI redesign summary** — what changed and why
4. **Complete Login page** — `frontend/src/app/login/page.tsx` (rewritten)
5. **Complete Signup page** — `frontend/src/app/register/page.tsx` (rewritten)
6. **Reusable auth components** — 5 components in `frontend/src/components/auth/`
7. **Updated navigation flow** — verify links between login ↔ register ↔ home
8. **List of modified files** — every file changed, with a one-line summary
9. **Screenshots** — light + dark mode, desktop + mobile, both pages
10. **Verification** — confirm login and signup still work end-to-end

---

# Implementation Order

1. **Phase 1: Review** — Analyze current auth pages, produce report
2. **Phase 2: Components** — Build reusable auth components (AuthInput, PasswordInput, AuthButton, AuthCard, AuthHeader)
3. **Phase 3: Login** — Redesign login page using new components
4. **Phase 4: Signup** — Redesign signup page using new components
5. **Phase 5: Verify** — Test both flows, fix issues, take screenshots

Analyze first. Then implement the complete redesign. Do not stop after analysis.

Run the application, verify the screens, fix issues, and iterate until the Login and Signup experience feels comparable in quality to modern fintech applications such as TradingView and Moomoo.
