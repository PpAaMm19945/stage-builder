import { Suspense, lazy } from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Components
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { PageLoader } from "@/components/ui/PageLoader";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages - Lazy Loaded
const GuestHome = lazy(() => import("./components/guest/GuestHome"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/auth/Callback"));

// THE ANCHOR: Main Dashboard View
const DailyAnchorView = lazy(() => import("./components/anchor/DailyAnchorView"));

// Core Pages
const LibraryPage = lazy(() => import("./pages/library/index"));
const ActivityViewer = lazy(() => import("./pages/early-years/ActivityViewer"));
const ProgressPage = lazy(() => import("./pages/early-years/Progress"));
const Reading = lazy(() => import("./pages/early-years/Reading"));
const PortfolioPage = lazy(() => import("./pages/early-years/Portfolio"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const TrustCovenant = lazy(() => import("./pages/TrustCovenant"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AIDashboard = lazy(() => import("./pages/admin/AIDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="schoolos-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AudioPlayerProvider>
            <TooltipProvider>
              <GlobalAudioPlayer />
              <BrowserRouter>
                <Routes>
                  {/* Auth Callback - Must be outside layouts */}
                  <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>} />

                  {/* Public Auth Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
                  </Route>

                  {/* Main App Shell - Wraps both Public and Protected Routes */}
                  {/* Suspense is inside MainLayout so sidebar stays visible */}
                  <Route element={<MainLayout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<GuestHome />} />

                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/library/activities" element={<LibraryPage />} />
                    <Route path="/library/books" element={<LibraryPage />} />
                    <Route path="/library/hymns" element={<LibraryPage />} />
                    <Route path="/library/activities/:id" element={<ActivityViewer />} />

                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/trust" element={<TrustCovenant />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                      {/* THE ANCHOR: Main View */}
                      <Route path="/dashboard" element={<DailyAnchorView />} />

                      <Route path="/progress" element={<ProgressPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* Early Years - Legacy routes kept for portfolio */}
                      <Route path="/early-years/reading" element={<Reading />} />
                      <Route path="/early-years/portfolio/:studentId" element={<PortfolioPage />} />
                    </Route>

                    <Route path="/admin/ai" element={<ProtectedRoute><AIDashboard /></ProtectedRoute>} />
                  </Route>

                  {/* Backward Compatibility Redirects */}
                  <Route path="/early-years/*" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/planner" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/lower-primary" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/middle-school" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/upper-school" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/student" element={<Navigate to="/dashboard" replace />} />

                  {/* Catch-all */}
                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AudioPlayerProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;

