import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthState, UploadState, User, Photo } from "@/types";
import { getCurrentMonthYear, showErrorToast, showSuccessToast } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import PhotoView from "./pages/PhotoView";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import StaffLogin from "./components/StaffLogin";
import UploadPhoto from "./components/UploadPhoto";

// Updated upload limit and vote limit constants
const MAX_UPLOADS_PER_MONTH = 3;
const MAX_VOTES_PER_USER = 3;

const queryClient = new QueryClient();

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
  
  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session && session.user) {
              // Get user data from our users table
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (userError) {
                console.error("Error fetching user data:", userError);
                setAuth({
                  user: null,
                  isStaff: false,
                  isLoading: false
                });
                return;
              }

              // Create user object from auth and database data
              const user: User = {
                id: session.user.id,
                email: session.user.email || '',
                callsign: userData.callsign,
                firstName: userData.first_name,
                lastName: userData.last_name,
                isStaff: userData.is_staff || false,
                createdAt: userData.created_at
              };

              setAuth({
                user,
                isStaff: userData.is_staff || false,
                isLoading: false
              });
            } else {
              setAuth({
                user: null,
                isStaff: false,
                isLoading: false
              });
            }
          }
        );

        // Check for existing session on initial load
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Get user data from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            console.error("Error fetching user data:", userError);
            setAuth({
              user: null,
              isStaff: false,
              isLoading: false
            });
            return;
          }

          // Create user object from auth and database data
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            callsign: userData.callsign,
            firstName: userData.first_name,
            lastName: userData.last_name,
            isStaff: userData.is_staff || false,
            createdAt: userData.created_at
          };

          setAuth({
            user,
            isStaff: userData.is_staff || false,
            isLoading: false
          });
        } else {
          setAuth({
            user: null,
            isStaff: false,
            isLoading: false
          });
        }

        return () => {
          subscription.unsubscribe();
        };
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
        const { month, year } = getCurrentMonthYear();

        // Get upload count
        const { count: uploadCount, error: uploadError } = await supabase
          .from('photos')
          .select('id', { count: 'exact' })
          .eq('user_id', auth.user.id)
          .eq('upload_month', month)
          .eq('upload_year', year);
        
        if (uploadError) {
          throw uploadError;
        }

        // Get votes count
        const { count: votesUsed, error: votesError } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('user_id', auth.user.id);
        
        if (votesError) {
          throw votesError;
        }

        setUploadState({
          uploadCount: uploadCount || 0,
          uploadLimit: MAX_UPLOADS_PER_MONTH,
          votesUsed: votesUsed || 0,
          voteLimit: MAX_VOTES_PER_USER
        });
      } catch (error) {
        console.error("Error updating upload state:", error);
      }
    };
    
    updateUploadState();
  }, [auth.user]);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setAuth({
        user: null,
        isStaff: false,
        isLoading: false
      });
      
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // The auth listener will update the user state
      return;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  const handleRegister = async (email: string, callsign: string, firstName: string, lastName: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            callsign,
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        throw error;
      }

      // Authentication success - the trigger we set up in the database will handle creating the user record
      return;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };
  
  const handleStaffLogin = (password: string) => {
    const isValidStaff = password === "asxfoto10";
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
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${auth.user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }
      
      const { month, year } = getCurrentMonthYear();
      
      // Insert photo record in database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: auth.user.id,
          title,
          description,
          image_url: urlData.publicUrl,
          callsign: auth.user.callsign,
          uploader_name: `${auth.user.firstName} ${auth.user.lastName}`,
          upload_month: month,
          upload_year: year
        });
      
      if (dbError) {
        throw dbError;
      }
      
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
      // Insert vote record
      const { error } = await supabase
        .from('votes')
        .insert({
          user_id: auth.user.id,
          photo_id: photoId
        });
      
      if (error) {
        throw error;
      }
      
      // Fix: Use direct SQL update instead of RPC to avoid type issues
      const { error: updateError } = await supabase
        .from('photos')
        .update({ vote_count: supabase.sql`vote_count + 1` })
        .eq('id', photoId);
      
      if (updateError) {
        throw updateError;
      }
      
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
      const { error } = await supabase
        .from('photos')
        .update({ approved: true })
        .eq('id', photoId);
      
      if (error) {
        throw error;
      }
      
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
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      
      if (error) {
        throw error;
      }
      
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
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      
      if (error) {
        throw error;
      }
      
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
      // We can't use admin methods from the client
      // Instead, just delete from the users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  };
  
  const handleCreateUser = async (email: string, callsign: string, firstName: string, lastName: string, password: string) => {
    try {
      // Use the sign up method which is available on the client
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            callsign,
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // Update the users table manually if needed
      if (data.user) {
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email,
            callsign,
            first_name: firstName,
            last_name: lastName
          });

        if (updateError) {
          throw updateError;
        }
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  };
  
  const handleEditUser = async (userId: string, userData: Partial<User>) => {
    try {
      // Update users table
      const { error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          callsign: userData.callsign,
          first_name: userData.firstName,
          last_name: userData.lastName,
          is_staff: userData.isStaff
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Edit user error:", error);
      throw error;
    }
  };
  
  const handleResetPhotos = async () => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all
      
      if (error) {
        throw error;
      }
      
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
