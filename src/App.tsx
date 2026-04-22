import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquiryPopup from "@/components/EnquiryPopup";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LiveClassesPage from "./pages/LiveClassesPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import NotesPage from "./pages/NotesPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CourseLearningPage from "./pages/CourseLearningPage";
import ProfilePage from "./pages/ProfilePage";
import SupportPage from "./pages/SupportPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:id" element={<CourseDetailPage />} />
                  <Route path="/live-classes" element={<LiveClassesPage />} />
                  <Route path="/articles" element={<ArticlesPage />} />
                  <Route path="/articles/:id" element={<ArticleDetailPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/my-courses" element={<MyCoursesPage />} />
                  <Route path="/learn/:id" element={<CourseLearningPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
