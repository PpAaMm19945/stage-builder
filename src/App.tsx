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
import { ActivityProgressProvider } from "@/contexts/ActivityProgressContext";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";

// Pages
import Login from "./pages/Login";
import AuthCallback from "./pages/auth/Callback";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/early-years/Today";
import Activities from "./pages/early-years/Activities";
import ActivityViewer from "./pages/early-years/ActivityViewer";
import ProgressPage from "./pages/early-years/Progress";
import Settings from "./pages/Settings";
import LockedStage from "./pages/stages/LockedStage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ActivityProgressProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/early-years/today" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Early Years */}
                <Route path="/early-years/today" element={<Today />} />
                <Route path="/early-years/activities" element={<Activities />} />
                <Route path="/early-years/activities/:id" element={<ActivityViewer />} />
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
      </ActivityProgressProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
