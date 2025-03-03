
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateTemplate from "./components/CreateTemplate";
import StoreReports from "./components/StoreReports";
import ReportSummary from "./components/ReportSummary";
import { SideMenu } from "./components/SideMenu";
import Navbar from "./components/Navbar";
import TemplatesList from "./components/TemplatesList";

const queryClient = new QueryClient();

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/templates" element={
            <AppLayout>
              <h1 className="text-3xl font-semibold tracking-tight mb-6">Templates</h1>
              <p className="text-muted-foreground mb-8">
                View and manage your report templates
              </p>
              <TemplatesList />
            </AppLayout>
          } />
          <Route path="/templates/create" element={
            <AppLayout>
              <CreateTemplate />
            </AppLayout>
          } />
          <Route path="/reports" element={
            <AppLayout>
              <StoreReports />
            </AppLayout>
          } />
          <Route path="/summaries" element={
            <AppLayout>
              <ReportSummary />
            </AppLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
