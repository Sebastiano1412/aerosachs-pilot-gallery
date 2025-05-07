import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthState, UploadState, User, Photo } from "@/types";
import { getCurrentMonthYear, MAX_UPLOADS_PER_MONTH, MAX_VOTES_PER_USER } from "@/lib/utils";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import PhotoView from "./pages/PhotoView";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import StaffLogin from "./components/StaffLogin";
import UploadPhoto from "./components/UploadPhoto";

const queryClient = new QueryClient();

// This is a placeholder for Supabase Integration
const supabaseIntegration = {
  login: async (email: string, password: string): Promise<User> => {
    // This would be replaced with actual Supabase auth
    console.log("Login:", email, password);
    throw new Error("Not implemented - requires Supabase");
  },
  
  register: async (email: string, callsign: string, firstName: string, lastName: string, password: string): Promise<User> => {
    // This would be replaced with actual Supabase auth
    console.log("Register:", email, callsign, firstName, lastName, password);
    throw new Error("Not implemented - requires Supabase");
  },
  
  staffLogin: (password: string): boolean => {
    // In real implementation, this would set some session state in Supabase
    return password === "asxfoto10";
  },
  
  uploadPhoto: async (userId: string, title: string, description: string, file: File): Promise<void> => {
    // This would be replaced with actual Supabase storage and database
    console.log("Upload photo:", userId, title, description, file);
    throw new Error("Not implemented - requires Supabase");
  },
  
  votePhoto: async (userId: string, photoId: string): Promise<void> => {
    // This would update votes in Supabase
    console.log("Vote photo:", userId, photoId);
    throw new Error("Not implemented - requires Supabase");
  },
  
  approvePhoto: async (photoId: string): Promise<void> => {
    // This would update the photo status in Supabase
    console.log("Approve photo:", photoId);
    throw new Error("Not implemented - requires Supabase");
  },
  
  rejectPhoto: async (photoId: string): Promise<void> => {
    // This would delete the photo from Supabase
    console.log("Reject photo:", photoId);
    throw new Error("Not implemented - requires Supabase");
  },
  
  deletePhoto: async (photoId: string): Promise<void> => {
    // This would delete the photo from Supabase
    console.log("Delete photo:", photoId);
    throw new Error("Not implemented - requires Supabase");
  },
  
  deleteUser: async (userId: string): Promise<void> => {
    // This would delete the user from Supabase
    console.log("Delete user:", userId);
    throw new Error("Not implemented - requires Supabase");
  },
  
  createUser: async (email: string, callsign: string, firstName: string, lastName: string, password: string): Promise<void> => {
    // This would create a user in Supabase
    console.log("Create user:", email, callsign, firstName, lastName, password);
    throw new Error("Not implemented - requires Supabase");
  },
  
  editUser: async (userId: string, userData: Partial<User>): Promise<void> => {
    // This would update user in Supabase
    console.log("Edit user:", userId, userData);
    throw new Error("Not implemented - requires Supabase");
  },
  
  resetPhotos: async (): Promise<void> => {
    // This would reset all photos in Supabase
    console.log("Reset photos");
    throw new Error("Not implemented - requires Supabase");
  },
  
  getUserUploadsCount: async (userId: string): Promise<number> => {
    // This would count user uploads for current month
    console.log("Get user uploads count:", userId);
    return 0;
  },
  
  getUserVotesCount: async (userId: string): Promise<number> => {
    // This would count user votes for current month
    console.log("Get user votes count:", userId);
    return 0;
  }
};

function AppRoutes() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isStaff: false,
    isLoading: true
  });
  
  const [uploadState, setUploadState] = useState<UploadState>({
    uploadCount: 0,
    uploadLimit: MAX_UPLOADS_PER_MONTH,
    votesUsed: 0,
    voteLimit: MAX_VOTES_PER_USER
  });
  
  const navigate = useNavigate();
  
  // Simulate checking session on app load
  useEffect(() => {
    // In real app, this would check Supabase session
    const checkSession = async () => {
      try {
        // Simulate delay
        await new Promise(r => setTimeout(r, 500));
        
        // In real app, this would get session from Supabase
        setAuth({
          user: null,
          isStaff: false,
          isLoading: false
        });
      } catch (error) {
        console.error("Session check error:", error);
        setAuth({
          user: null,
          isStaff: false,
          isLoading: false
        });
      }
    };
    
    checkSession();
  }, []);
  
  // Keep upload state in sync with user
  useEffect(() => {
    const updateUploadState = async () => {
      if (!auth.user) {
        setUploadState({
          uploadCount: 0,
          uploadLimit: MAX_UPLOADS_PER_MONTH,
          votesUsed: 0,
          voteLimit: MAX_VOTES_PER_USER
        });
        return;
      }
      
      try {
        // In real app, these would be actual queries to Supabase
        const uploadCount = await supabaseIntegration.getUserUploadsCount(auth.user.id);
        const votesUsed = await supabaseIntegration.getUserVotesCount(auth.user.id);
        
        setUploadState({
          uploadCount,
          uploadLimit: MAX_UPLOADS_PER_MONTH,
          votesUsed,
          voteLimit: MAX_VOTES_PER_USER
        });
      } catch (error) {
        console.error("Error updating upload state:", error);
      }
    };
    
    updateUploadState();
  }, [auth.user]);
  
  const handleLogout = () => {
    setAuth({
      user: null,
      isStaff: false,
      isLoading: false
    });
    navigate("/");
  };
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await supabaseIntegration.login(email, password);
      setAuth({
        user,
        isStaff: false,
        isLoading: false
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  const handleRegister = async (email: string, callsign: string, firstName: string, lastName: string, password: string) => {
    try {
      const user = await supabaseIntegration.register(email, callsign, firstName, lastName, password);
      setAuth({
        user,
        isStaff: false,
        isLoading: false
      });
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };
  
  const handleStaffLogin = (password: string) => {
    const isValidStaff = supabaseIntegration.staffLogin(password);
    if (isValidStaff) {
      setAuth({
        user: null,
        isStaff: true,
        isLoading: false
      });
    }
  };
  
  const handleUploadPhoto = async (title: string, description: string, file: File) => {
    if (!auth.user) return;
    
    try {
      await supabaseIntegration.uploadPhoto(auth.user.id, title, description, file);
      
      // Update upload count
      setUploadState(prev => ({
        ...prev,
        uploadCount: prev.uploadCount + 1
      }));
      
      // Invalidate photos query to refetch
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };
  
  const handleVotePhoto = async (photoId: string) => {
    if (!auth.user) return;
    
    try {
      await supabaseIntegration.votePhoto(auth.user.id, photoId);
      
      // Update votes used
      setUploadState(prev => ({
        ...prev,
        votesUsed: prev.votesUsed + 1
      }));
      
      // Invalidate photos query to refetch
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    } catch (error) {
      console.error("Vote error:", error);
      throw error;
    }
  };
  
  const handleApprovePhoto = async (photoId: string) => {
    try {
      await supabaseIntegration.approvePhoto(photoId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
    } catch (error) {
      console.error("Approve photo error:", error);
      throw error;
    }
  };
  
  const handleRejectPhoto = async (photoId: string) => {
    try {
      await supabaseIntegration.rejectPhoto(photoId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    } catch (error) {
      console.error("Reject photo error:", error);
      throw error;
    }
  };
  
  const handleDeletePhoto = async (photoId: string) => {
    try {
      await supabaseIntegration.deletePhoto(photoId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    } catch (error) {
      console.error("Delete photo error:", error);
      throw error;
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await supabaseIntegration.deleteUser(userId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  };
  
  const handleCreateUser = async (email: string, callsign: string, firstName: string, lastName: string, password: string) => {
    try {
      await supabaseIntegration.createUser(email, callsign, firstName, lastName, password);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  };
  
  const handleEditUser = async (userId: string, userData: Partial<User>) => {
    try {
      await supabaseIntegration.editUser(userId, userData);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Edit user error:", error);
      throw error;
    }
  };
  
  const handleResetPhotos = async () => {
    try {
      await supabaseIntegration.resetPhotos();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    } catch (error) {
      console.error("Reset photos error:", error);
      throw error;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Index auth={auth} uploadState={uploadState} onLogout={handleLogout} onVotePhoto={handleVotePhoto} />} />
      <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
      <Route path="/staff-login" element={<StaffLogin onStaffLogin={handleStaffLogin} />} />
      <Route path="/dashboard" element={<Dashboard auth={auth} uploadState={uploadState} onLogout={handleLogout} onVotePhoto={handleVotePhoto} />} />
      <Route path="/upload" element={<UploadPhoto uploadState={uploadState} onUpload={handleUploadPhoto} />} />
      <Route path="/photo/:photoId" element={<PhotoView auth={auth} uploadState={uploadState} onLogout={handleLogout} onVotePhoto={handleVotePhoto} />} />
      <Route path="/staff" element={
        <StaffDashboard 
          auth={auth} 
          onLogout={handleLogout}
          onApprovePhoto={handleApprovePhoto}
          onRejectPhoto={handleRejectPhoto}
          onDeletePhoto={handleDeletePhoto}
          onDeleteUser={handleDeleteUser}
          onCreateUser={handleCreateUser}
          onEditUser={handleEditUser}
          onResetPhotos={handleResetPhotos}
        />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
