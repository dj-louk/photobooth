import { useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

// Photobooth Pages
import WelcomeScreen from "@/pages/photobooth/WelcomeScreen";
import GroupNameScreen from "@/pages/photobooth/GroupNameScreen";
import PhotoSequenceScreen from "@/pages/photobooth/PhotoSequenceScreen";
import PreviewScreen from "@/pages/photobooth/PreviewScreen";
import ProcessingScreen from "@/pages/photobooth/ProcessingScreen";

// Station Pages
import StationSearch from "@/pages/station/StationSearch";
import StationGallery from "@/pages/station/StationGallery";
import TVInstructions from "@/pages/station/TVInstructions";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminGroups from "@/pages/admin/AdminGroups";

// Public Gallery
import PublicGallery from "@/pages/public/PublicGallery";

// Router with session_id detection
function AppRouter() {
  const location = useLocation();
  
  

  return (
    <Routes>
      {/* Photobooth Interface */}
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/photobooth" element={<WelcomeScreen />} />
      <Route path="/photobooth/group" element={<GroupNameScreen />} />
      <Route path="/photobooth/capture" element={<PhotoSequenceScreen />} />
      <Route path="/photobooth/preview" element={<PreviewScreen />} />
      <Route path="/photobooth/processing" element={<ProcessingScreen />} />
      
      {/* Station Interface */}
      <Route path="/station" element={<StationSearch />} />
      <Route path="/station/gallery/:groupId" element={<StationGallery />} />
      <Route path="/tv" element={<TVInstructions />} />
      
      {/* Public Gallery (QR Code destination) */}
      <Route path="/gallery/:groupId" element={<PublicGallery />} />
      
      {/* Admin Interface */}
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/events" element={<AdminEvents />} />
<Route path="/admin/settings" element={<AdminSettings />} />
<Route path="/admin/groups" element={<AdminGroups />} />


function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="App min-h-screen bg-background text-foreground">
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
  <Toaster position="top-center" richColors />
</div>

    </ThemeProvider>
  );
}

export default App;
