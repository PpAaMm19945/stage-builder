import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import AuthCallback from "./pages/auth/Callback";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/early-years/Planner";
import Today from "./pages/early-years/Today";
import Activities from "./pages/early-years/Activities";
import ActivityViewer from "./pages/early-years/ActivityViewer";
import ProgressPage from "./pages/early-years/Progress";
import Reading from "./pages/early-years/Reading";
import Settings from "./pages/Settings";
import LockedStage from "./pages/stages/LockedStage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="schoolos-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth Callback - Must be outside PublicLayout */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />

                  {/* Early Years */}
                  <Route path="/early-years/planner" element={<Planner />} />
                  <Route path="/early-years/today" element={<Navigate to="/" replace />} />
                  <Route path="/early-years/activities" element={<Activities />} />
                  <Route path="/early-years/activities/:id" element={<ActivityViewer />} />
                  <Route path="/early-years/reading" element={<Reading />} />
                  <Route path="/early-years/progress" element={<ProgressPage />} />

                  {/* Locked Stages */}
                  <Route path="/lower-primary" element={<LockedStage />} />
                  <Route path="/middle-school" element={<LockedStage />} />
                  <Route path="/upper-school" element={<LockedStage />} />

                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;

