# SchoolOS UX/UI Improvements - Complete Handoff

> **For:** New agent instance to complete remaining UX work and conduct comprehensive testing
> **Date:** 2026-01-01
> **Priority:** Complete remaining tasks, then test everything using dev bypass mode

---

## Your Mission

1. **Implement dev bypass authentication** (for testing without Google OAuth)
2. **Complete 4 remaining UX tasks** (mobile nav, route cleanup, Support section, right panel)
3. **Test all 13 scenarios** using the bypass auth

---

## Testing Account Setup

### Option 1: Use a Personal Gmail Account (Simplest)
Sign in with any Gmail account. Create test children with varied ages.

### Option 2: Multiple Browser Profiles
Use Chrome profiles with different Google accounts for multi-user testing.

### Option 3: Dev Bypass Mode (Recommended) ⭐

**Implement this in the Cloudflare Worker** to bypass Google OAuth during development:

**File:** `cloudflare/src/index.ts`

Add this route BEFORE the auth middleware (around line 175):

```typescript
// ============ DEV BYPASS AUTH (Development Only) ============
// Access: GET /auth/dev-bypass?email=test@example.com&name=Test%20User
// This creates or finds a user and returns a JWT token
app.get('/auth/dev-bypass', async (c) => {
  // Only allow in development
  if (c.env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Dev bypass not available in production' }, 403);
  }

  const email = c.req.query('email') || 'test.family@schoolos.dev';
  const name = c.req.query('name') || 'Test Family';

  try {
    // Find or create user
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();

    if (!user) {
      const userId = generateId('user');
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider) VALUES (?, ?, ?, NULL, ?)'
      ).bind(userId, email, name, 'dev-bypass').run();
      
      user = { id: userId, email, name, avatar_url: null, provider: 'dev-bypass' };
    }

    // Generate JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days for dev
    }, c.env.JWT_SECRET);

    // Return token (frontend can store and use)
    return c.json({ 
      token: jwt, 
      user: { id: user.id, email: user.email, name: user.name },
      message: 'Dev bypass successful. Store this token in localStorage as "schoolos_token"'
    });
  } catch (error) {
    console.error('Dev bypass error:', error);
    return c.json({ error: 'Dev bypass failed' }, 500);
  }
});
```

**How to use:**
1. Start local dev server: `cd cloudflare && npx wrangler dev`
2. Visit: `http://localhost:8787/auth/dev-bypass?email=mama@test.com&name=Mama%20Amara`
3. Copy the returned `token`
4. In browser console on the frontend: `localStorage.setItem('schoolos_token', 'YOUR_TOKEN_HERE')`
5. Refresh - you're now logged in as that test user

**Test user suggestions:**
```
/auth/dev-bypass?email=single.mom@test.com&name=Amara%20(Single%20Mom)
/auth/dev-bypass?email=large.family@test.com&name=Joseph%20and%20Grace
/auth/dev-bypass?email=new.mother@test.com&name=Ngozi%20(New%20Mom)
```

---

## Remaining Tasks (Your To-Do List)

### Task 1: Implement Dev Bypass Auth
**File:** `cloudflare/src/index.ts`
- Add the dev bypass route shown above
- Test it works locally

### Task 2: Remove Redundant `/early-years/today` Route
**File:** `src/App.tsx`

Replace this line:
```tsx
<Route path="/early-years/today" element={<Today />} />
```

With a redirect:
```tsx
<Route path="/early-years/today" element={<Navigate to="/" replace />} />
```

Add `Navigate` to imports from `react-router-dom`.

### Task 3: Add Mobile Bottom Navigation
**Create:** `src/components/layout/BottomNav.tsx`

```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { House, Books, TrendUp, Heart } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: House, label: 'Today', path: '/' },
  { icon: Books, label: 'Library', path: '/early-years/activities' },
  { icon: TrendUp, label: 'Progress', path: '/early-years/progress' },
  { icon: Heart, label: 'Support', path: '/settings#support' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-6 w-6" weight={isActive ? "fill" : "duotone"} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

**Update:** `src/components/layout/MainLayout.tsx`
- Import and add `<BottomNav />` before the closing `</SidebarProvider>`
- Add `pb-16 lg:pb-0` to main content area to account for bottom nav

### Task 4: Add "Support SchoolOS" Section in Settings
**File:** `src/pages/Settings.tsx`

Add this section after the Appearance card:

```tsx
{/* Support SchoolOS */}
<Card id="support" className="border-green-200 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/10">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
      <Heart className="h-5 w-5" weight="fill" />
      Support SchoolOS
    </CardTitle>
    <CardDescription>
      Help keep learning free for African families
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Monthly Goal</span>
        <span className="font-medium">$412 / $500</span>
      </div>
      <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 w-[82%] rounded-full" />
      </div>
      <p className="text-xs text-muted-foreground">
        $500/month covers storage for 10,000 families and 1,000+ books
      </p>
    </div>
    
    <div className="grid grid-cols-4 gap-2">
      <Button variant="outline" className="border-green-300">$1</Button>
      <Button variant="outline" className="border-green-300">$5</Button>
      <Button variant="outline" className="border-green-300">$10</Button>
      <Button variant="outline" className="border-green-300">Other</Button>
    </div>
    
    <p className="text-xs text-center text-muted-foreground">
      Contributions are not tax-deductible. Payment processed securely.
    </p>
  </CardContent>
</Card>
```

Add `Heart` to the Phosphor icons import at the top.

### Task 5: Populate Right Panel with Page-Specific Filters
**File:** `src/components/layout/MainLayout.tsx`

Update the RightPanel children based on route:

```tsx
<RightPanel 
  title={getRightPanelTitle()} 
  isOpen={rightPanelOpen}
  onClose={() => setRightPanelOpen(false)}
>
  {/* Route-specific content */}
  {location.pathname === '/' && (
    <>
      <RightPanelSection title="Quick Filters">
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            🕐 5-minute activities
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            🧹 Low mess only
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            📦 Things I have
          </Button>
        </div>
      </RightPanelSection>
      <RightPanelSection title="Materials Needed Today">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </RightPanelSection>
    </>
  )}
  
  {location.pathname.includes('/activities') && (
    <RightPanelSection title="Filter Activities">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Domain</label>
          <select className="w-full mt-1 border rounded-md p-2 text-sm">
            <option>All Domains</option>
            <option>Motor Skills</option>
            <option>Language</option>
            <option>Cognitive</option>
            <option>Social-Emotional</option>
            <option>Pre-Academic</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Duration</label>
          <select className="w-full mt-1 border rounded-md p-2 text-sm">
            <option>Any duration</option>
            <option>Under 10 min</option>
            <option>10-20 min</option>
            <option>Over 20 min</option>
          </select>
        </div>
      </div>
    </RightPanelSection>
  )}
  
  {location.pathname.includes('/progress') && (
    <RightPanelSection title="Child Stats">
      <p className="text-sm text-muted-foreground">
        Select a child to see detailed progress
      </p>
    </RightPanelSection>
  )}
  
  {/* Funding Widget - Always visible */}
  <RightPanelSection>
    <FundingWidget raised={412} goal={500} />
  </RightPanelSection>
</RightPanel>
```

---

## Testing Scenarios (After Implementation)

Execute these with dev bypass auth:

| # | Scenario | What to Verify |
|---|----------|----------------|
| 1 | Dev bypass auth | Token generation, localStorage storage, login works |
| 2 | New user onboarding | Welcome flow, add child, materials setup |
| 3 | Dashboard (1 child) | Activities load, buttons work |
| 4 | Dashboard (2+ children) | Child selector, tiered expectations |
| 5 | Infancy Mode | "Gentle Moments" header, soft UI |
| 6 | Activity Library | Filters, search, open activity |
| 7 | Books/Reading | Books load, reader works |
| 8 | Progress tracking | Domain stats, completion history |
| 9 | Settings page | Edit child, materials, theme, **Support section** |
| 10 | Right panel (desktop) | Visible, route-specific filters |
| 11 | Right panel (mobile) | Toggle button, slide-in overlay |
| 12 | **Bottom nav (mobile)** | 4 items, active states, navigation |
| 13 | `/early-years/today` redirect | Should redirect to `/` |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `cloudflare/src/index.ts` | Backend API - add dev bypass here |
| `src/App.tsx` | Routes - remove redundant route |
| `src/components/layout/MainLayout.tsx` | Layout - add BottomNav, update RightPanel |
| `src/components/layout/BottomNav.tsx` | **CREATE** Mobile bottom navigation |
| `src/pages/Settings.tsx` | Settings - add Support section |

---

## Build Commands

```bash
# PowerShell workaround for npm
cmd /c "npm run build"

# Run frontend locally
cmd /c "npm run dev"

# Run backend locally
cd cloudflare
npx wrangler dev
```

---

## Success Criteria

When complete, verify:
- [ ] Dev bypass auth works in development
- [ ] `/early-years/today` redirects to `/`
- [ ] Mobile bottom nav appears on small screens
- [ ] Support section visible in Settings
- [ ] Right panel shows route-specific filters
- [ ] All 13 test scenarios pass
- [ ] Build succeeds without errors
