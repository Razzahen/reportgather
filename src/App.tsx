
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/templates" element={
            <div className="min-h-screen flex w-full bg-background">
              <div className="flex-1 ml-16 md:ml-64">
                <main className="container mx-auto px-4 py-8 pt-24">
                  <h1 className="text-3xl font-semibold tracking-tight mb-6">Templates</h1>
                  <p className="text-muted-foreground mb-8">
                    View and manage your report templates
                  </p>
                </main>
              </div>
            </div>
          } />
          <Route path="/templates/create" element={
            <div className="min-h-screen flex w-full bg-background">
              <div className="flex-1 ml-16 md:ml-64">
                <main className="container mx-auto px-4 py-8 pt-24">
                  <CreateTemplate />
                </main>
              </div>
            </div>
          } />
          <Route path="/reports" element={
            <div className="min-h-screen flex w-full bg-background">
              <div className="flex-1 ml-16 md:ml-64">
                <main className="container mx-auto px-4 py-8 pt-24">
                  <StoreReports />
                </main>
              </div>
            </div>
          } />
          <Route path="/summaries" element={
            <div className="min-h-screen flex w-full bg-background">
              <div className="flex-1 ml-16 md:ml-64">
                <main className="container mx-auto px-4 py-8 pt-24">
                  <ReportSummary />
                </main>
              </div>
            </div>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
