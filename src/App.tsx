import { Suspense, lazy } from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { PublicLibraryLayout } from "@/components/layout/PublicLibraryLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages - Lazy Loaded
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/auth/Callback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Planner = lazy(() => import("./pages/early-years/Planner"));
const DailyPractices = lazy(() => import("./pages/early-years/DailyPractices"));
const LibraryPage = lazy(() => import("./pages/library/index"));
const PathsPage = lazy(() => import("./pages/library/Paths"));
const ActivityViewer = lazy(() => import("./pages/early-years/ActivityViewer"));
const ProgressPage = lazy(() => import("./pages/early-years/Progress"));
const Reading = lazy(() => import("./pages/early-years/Reading"));
const PortfolioPage = lazy(() => import("./pages/early-years/Portfolio"));
const ScopeSequence = lazy(() => import("./pages/early-years/ScopeSequence"));
const Settings = lazy(() => import("./pages/Settings"));
const Reports = lazy(() => import("./pages/Reports"));
const StudentPortal = lazy(() => import("./pages/student/StudentPortal"));
const LockedStage = lazy(() => import("./pages/stages/LockedStage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const TrustCovenant = lazy(() => import("./pages/TrustCovenant"));

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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Landing Page - Public */}
                    <Route path="/" element={<Landing />} />

                    {/* Auth Callback - Must be outside layouts */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Public Auth Routes */}
                    <Route element={<PublicLayout />}>
                      <Route path="/login" element={<Login />} />
                    </Route>

                    {/* Public Library Routes - Accessible without login */}
                    <Route element={<PublicLibraryLayout />}>
                      <Route path="/library" element={<LibraryPage />} />
                      <Route path="/library/activities" element={<LibraryPage />} />
                      <Route path="/library/books" element={<LibraryPage />} />
                      <Route path="/library/hymns" element={<LibraryPage />} />
                      <Route path="/library/paths" element={<PathsPage />} />
                      <Route path="/library/activities/:id" element={<ActivityViewer />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/trust" element={<TrustCovenant />} />
                    </Route>

                    {/* Protected Routes - Requires Auth */}
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/planner" element={<Planner />} />
                      <Route path="/progress" element={<ProgressPage />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />

                      {/* Early Years - Legacy routes that still need auth */}
                      <Route path="/early-years/planner" element={<Navigate to="/planner" replace />} />
                      <Route path="/early-years/daily-practices" element={<DailyPractices />} />
                      <Route path="/early-years/today" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/early-years/reading" element={<Reading />} />
                      <Route path="/early-years/progress" element={<Navigate to="/progress" replace />} />
                      <Route path="/early-years/portfolio/:studentId" element={<PortfolioPage />} />
                      <Route path="/early-years/scope-sequence" element={<ScopeSequence />} />

                      {/* Locked Stages */}
                      <Route path="/lower-primary" element={<LockedStage />} />
                      <Route path="/middle-school" element={<LockedStage />} />
                      <Route path="/upper-school" element={<LockedStage />} />

                      {/* Phase 3: Student Portal */}
                      <Route path="/student" element={<StudentPortal />} />
                    </Route>

                    {/* Backward Compatibility Redirects */}
                    <Route path="/early-years/activities" element={<Navigate to="/library" replace />} />
                    <Route path="/early-years/activities/:id" element={<Navigate to="/library/activities/:id" replace />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AudioPlayerProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
