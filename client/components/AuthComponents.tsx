import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSigninInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSigninData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const clearFormData = () => {
    setSigninData({ email: "", password: "" });
    setSignupData({ email: "", password: "", confirmPassword: "" });
  };

  // Clear form data when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      clearFormData();
    }
  }, [isOpen]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(signinData.email, signinData.password);
      
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        onClose();
      } else {
        toast({
          title: "Sign in failed",
          description: result.error || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(signupData.email, signupData.password);
      
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Welcome to QuizCraft AI. You can now save and manage your quizzes.",
        });
        onClose();
      } else {
        toast({
          title: "Sign up failed",
          description: result.error || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glass-effect border-golden-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl glow-text">Welcome to QuizCraft AI</CardTitle>
          <CardDescription className="text-golden-700">
            Sign in to save your quizzes and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-golden-500" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signinData.email}
                      onChange={handleSigninInputChange}
                      className="pl-10 bg-white/50 border-golden-300 focus:border-golden-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-golden-500" />
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signinData.password}
                      onChange={handleSigninInputChange}
                      className="pl-10 pr-10 bg-white/50 border-golden-300 focus:border-golden-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-golden-500 hover:text-golden-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white"
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-golden-500" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={handleSignupInputChange}
                      className="pl-10 bg-white/50 border-golden-300 focus:border-golden-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-golden-500" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={handleSignupInputChange}
                      className="pl-10 pr-10 bg-white/50 border-golden-300 focus:border-golden-500"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-golden-500 hover:text-golden-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-golden-500" />
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupInputChange}
                      className="pl-10 bg-white/50 border-golden-300 focus:border-golden-500"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white"
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center space-y-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-golden-700 hover:text-golden-800 hover:bg-golden-50"
            >
              Continue without account
            </Button>
            <div className="text-xs text-golden-600">
              Having issues? Check our{" "}
              <a
                href="/firebase-setup"
                target="_blank"
                className="underline hover:text-golden-800"
              >
                Firebase setup guide
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserMenu() {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-golden-700">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-medium">{user.email}</div>
          {userProfile && (
            <div className="text-xs text-golden-600">
              {userProfile.totalQuizzes} quiz{userProfile.totalQuizzes !== 1 ? 'es' : ''} created
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="border-golden-300 hover:bg-golden-50"
      >
        Sign Out
      </Button>
    </div>
  );
}
