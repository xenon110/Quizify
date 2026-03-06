
'use client';

import { useState, useRef, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/layout/app-header";
import { User, Bell, TestTube2, LayoutPanelLeft, Bot, Shield, Upload, KeyRound, Languages, Palette, FileCog, Trash2, Loader2 } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
  const { user, loading: authLoading, refreshAuth } = useAuth();
  const { toast } = useToast();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [language, setLanguage] = useState('en');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const storedPhoto = localStorage.getItem(`photoURL-${user.uid}`);
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPreviewUrl(storedPhoto || user.photoURL || null);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(file);
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
      if (!auth.currentUser) {
          toast({
              variant: "destructive",
              title: "Not authenticated",
              description: "You must be logged in to update your profile.",
          });
          return;
      }
      setIsSaving(true);
      
      try {
          await updateProfile(auth.currentUser, {
            displayName: displayName
          });

          // Store photo in local storage for persistence simulation
          if (previewUrl && user) {
            localStorage.setItem(`photoURL-${user.uid}`, previewUrl);
          }
          
          refreshAuth();

          toast({
              title: "Settings Saved",
              description: "Your profile has been updated successfully.",
          });
      } catch (error) {
          console.error("Error updating profile:", error);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Could not save your changes. Please try again.",
          });
      } finally {
          setIsSaving(false);
      }
  };

  const handleChangePassword = () => {
      if (newPassword !== confirmNewPassword) {
          toast({
              variant: "destructive",
              title: "Passwords do not match",
              description: "Please ensure your new password and confirmation match.",
          });
          return;
      }
      if (newPassword.length < 6) {
          toast({
              variant: "destructive",
              title: "Password too short",
              description: "Your new password must be at least 6 characters long.",
          });
          return;
      }
      // Here you would typically call a backend function to change the password
      console.log("Changing password...");
      toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    const languageMap: { [key: string]: string } = {
        en: 'English',
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch',
        hi: 'हिन्दी',
        ja: '日本語'
    };
    toast({
        title: "Language preference updated",
        description: `Language has been set to ${languageMap[value]}.`,
    });
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 md:p-8">
            { authLoading || !user ? (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                 </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl font-bold">Settings</CardTitle>
                        <CardDescription>Manage your account and application preferences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
                            <TabsList className="flex md:flex-col h-auto items-stretch justify-start p-2 rounded-lg w-full md:w-1/5 bg-muted/50">
                                <TabsTrigger value="account" className="w-full justify-start px-3 py-2 text-sm sm:text-base"><User className="mr-2 h-5 w-5" />Account</TabsTrigger>
                                <TabsTrigger value="preferences" className="w-full justify-start px-3 py-2 text-sm sm:text-base"><TestTube2 className="mr-2 h-5 w-5" />Exam Preferences</TabsTrigger>
                                <TabsTrigger value="ui" className="w-full justify-start px-3 py-2 text-sm sm:text-base"><LayoutPanelLeft className="mr-2 h-5 w-5"/>Dashboard & UI</TabsTrigger>
                                <TabsTrigger value="ai" className="w-full justify-start px-3 py-2 text-sm sm:text-base"><Bot className="mr-2 h-5 w-5"/>PDF & AI</TabsTrigger>
                                <TabsTrigger value="security" className="w-full justify-start px-3 py-2 text-sm sm:text-base"><Shield className="mr-2 h-5 w-5"/>Security & Privacy</TabsTrigger>
                            </TabsList>
                            
                            <div className="flex-1">
                                <TabsContent value="account">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Account Settings</CardTitle>
                                            <CardDescription>Update your personal details and profile picture.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center gap-4 sm:gap-6 flex-col sm:flex-row">
                                                <Avatar className="h-20 w-20">
                                                    <AvatarImage src={previewUrl || userAvatar?.imageUrl} />
                                                    <AvatarFallback>{displayName?.charAt(0) || email?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-2 w-full sm:w-auto">
                                                     <Label htmlFor="picture">Profile Photo</Label>
                                                    <div className="flex gap-2">
                                                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/>Change</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { setPreviewUrl(null); setNewPhoto(null); }}>Remove</Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                </div>
                                            </div>
                                             <div className="space-y-2 pt-4">
                                                <Label>Password</Label>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="mt-2">
                                                                <Button variant="outline"><KeyRound className="mr-2 h-4 w-4" />Change Password</Button>
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Change Password</DialogTitle>
                                                                <DialogDescription>
                                                                    Enter your old and new password to update it.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="old-password" >
                                                                        Old Password
                                                                    </Label>
                                                                    <Input id="old-password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="col-span-3" />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="new-password">
                                                                        New Password
                                                                    </Label>
                                                                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="confirm-new-password">
                                                                        Confirm Password
                                                                    </Label>
                                                                    <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="col-span-3" />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button variant="outline">Cancel</Button>
                                                                </DialogClose>
                                                                <DialogClose asChild>
                                                                    <Button onClick={handleChangePassword}>Save Changes</Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                            </div>
                                             <div className="space-y-4">
                                                <Label>Notification Preferences</Label>
                                                <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                    <div>
                                                        <h4 className="font-medium">Email Notifications</h4>
                                                        <p className="text-sm text-muted-foreground">Receive updates and summaries via email.</p>
                                                    </div>
                                                    <Switch id="email-notifications" />
                                                </div>
                                                 <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                    <div>
                                                        <h4 className="font-medium">In-App Notifications</h4>
                                                        <p className="text-sm text-muted-foreground">Get notified directly within the platform.</p>
                                                    </div>
                                                    <Switch id="in-app-notifications" defaultChecked />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="preferences">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Exam & Test Preferences</CardTitle>
                                            <CardDescription>Customize your testing experience.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium">Default Exam Time</h4>
                                                    <p className="text-sm text-muted-foreground">Set a default duration for new exams.</p>
                                                </div>
                                                <Select defaultValue="90">
                                                    <SelectTrigger className="w-full sm:w-[180px]">
                                                        <SelectValue placeholder="Select time" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="60">60 minutes</SelectItem>
                                                        <SelectItem value="90">90 minutes</SelectItem>
                                                        <SelectItem value="120">120 minutes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium">Adaptive Difficulty</h4>
                                                    <p className="text-sm text-muted-foreground">Adjust question difficulty based on your answers.</p>
                                                </div>
                                                <Switch id="adaptive-difficulty" />
                                            </div>
                                            <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium">Answer Review Mode</h4>
                                                    <p className="text-sm text-muted-foreground">When to see correct answers and explanations.</p>
                                                </div>
                                                <Select defaultValue="after-submission">
                                                    <SelectTrigger className="w-full sm:w-[180px]">
                                                        <SelectValue placeholder="Select mode" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="after-submission">After Submission</SelectItem>
                                                        <SelectItem value="after-each">After Each Question</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                 <TabsContent value="ui">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Dashboard & UI Settings</CardTitle>
                                            <CardDescription>Personalize the application's look and feel.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between p-3 border rounded-md">
                                                <div>
                                                    <h4 className="font-medium flex items-center"><Palette className="mr-2 h-4 w-4"/>Theme</h4>
                                                    <p className="text-sm text-muted-foreground">Switch between light and dark modes.</p>
                                                </div>
                                                <p className="text-sm font-medium">Use header toggle</p>
                                            </div>
                                            <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium flex items-center"><Languages className="mr-2 h-4 w-4"/>Language</h4>
                                                    <p className="text-sm text-muted-foreground">Choose your preferred language.</p>
                                                </div>
                                                <Select value={language} onValueChange={handleLanguageChange}>
                                                    <SelectTrigger className="w-full sm:w-[180px]">
                                                        <SelectValue placeholder="Language" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="es">Español</SelectItem>
                                                        <SelectItem value="fr">Français</SelectItem>
                                                        <SelectItem value="de">Deutsch</SelectItem>
                                                        <SelectItem value="hi">हिन्दी</SelectItem>
                                                        <SelectItem value="ja">日本語</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                 <TabsContent value="ai">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>PDF & AI Settings</CardTitle>
                                            <CardDescription>Control how the AI processes your documents.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium flex items-center"><FileCog className="mr-2 h-4 w-4"/>Default Question Types</h4>
                                                    <p className="text-sm text-muted-foreground">Set default question types for PDF generation.</p>
                                                </div>
                                                <Select defaultValue="mcq">
                                                    <SelectTrigger className="w-full sm:w-[180px]">
                                                        <SelectValue placeholder="Question Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                                                        <SelectItem value="numeric">Numeric</SelectItem>
                                                        <SelectItem value="true-false">True/False</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium">AI Answer Prediction</h4>
                                                    <p className="text-sm text-muted-foreground">Allow AI to predict answers if none are provided.</p>
                                                </div>
                                                <Switch id="ai-prediction" defaultChecked/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="security">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Security & Privacy</CardTitle>
                                            <CardDescription>Manage your data and account security.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-start sm:items-center justify-between p-3 border rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium">Export Your Data</h4>
                                                    <p className="text-sm text-muted-foreground">Download all your exam and performance data.</p>
                                                </div>
                                                <Button variant="outline">Export as CSV</Button>
                                            </div>
                                            <div className="flex items-start sm:items-center justify-between p-3 border-destructive/50 border bg-destructive/5 rounded-md flex-col sm:flex-row gap-2">
                                                <div>
                                                    <h4 className="font-medium text-destructive flex items-center"><Trash2 className="mr-2 h-4 w-4"/>Delete Account</h4>
                                                    <p className="text-sm text-destructive/80">Permanently delete your account and all data.</p>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive">Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction>Yes, Delete My Account</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <div className="flex justify-end mt-6 md:mt-8">
                                    <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
