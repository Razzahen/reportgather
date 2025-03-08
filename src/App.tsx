
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import CreateTemplate from "./components/CreateTemplate";
import StoreReports from "./components/StoreReports";
import ReportSummary from "./components/ReportSummary";
import { SideMenu } from "./components/SideMenu";
import Navbar from "./components/Navbar";
import TemplatesList from "./components/TemplatesList";
import ProtectedRoute from "./components/ProtectedRoute";
import ViewTemplate from "./components/ViewTemplate";
import EditTemplate from "./components/EditTemplate";
import Stores from "./components/Stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex w-full bg-background">
    <SideMenu className="z-50" />
    <div className="flex-1 ml-16 md:ml-64">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-32">
        {children}
      </main>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/templates" element={
              <ProtectedRoute>
                <AppLayout>
                  <h1 className="text-3xl font-semibold tracking-tight mb-6">Templates</h1>
                  <p className="text-muted-foreground mb-8">
                    View and manage your report templates
                  </p>
                  <TemplatesList />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/templates/create" element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateTemplate />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/templates/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <ViewTemplate />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/templates/edit/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <EditTemplate />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/stores" element={
              <ProtectedRoute>
                <AppLayout>
                  <Stores />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <StoreReports />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/summaries" element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportSummary />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
