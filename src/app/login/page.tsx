
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/use-auth';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !mobile) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all the required fields.',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Passwords do not match.',
      });
      return;
    }
    await signUpWithEmail(email, password, name);
  };

  const handleSignIn = async () => {
    await signInWithEmail(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
       <div className="absolute top-4 left-4">
        <Link href="/welcome" className="flex items-center gap-2 text-foreground">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-semibold">Quizify</span>
        </Link>
      </div>
      <Tabs defaultValue="sign-in" className="w-full max-w-[400px]">
        <CardHeader className="text-center px-0">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button onClick={handleSignIn} className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="new-name">Your Name</Label>
                <Input id="new-name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input id="new-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input id="new-password" type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="mobile">Mobile No.</Label>
                <Input id="mobile" type="tel" placeholder="Enter your mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
              </div>
              <Button onClick={handleSignUp} className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>
        <div className="mt-6">
            <Button onClick={signInWithGoogle} variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                </svg>
                Google
            </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground mt-6">
            By signing up, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
            </a>
            .
        </p>
      </Tabs>
    </div>
  );
}
