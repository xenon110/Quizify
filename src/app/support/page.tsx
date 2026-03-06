
'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, LifeBuoy, Send, Loader2, Twitter, Linkedin, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function SupportPage() {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            if (response.ok) {
                toast({
                    title: "Message Sent!",
                    description: "Thank you for contacting us. We'll get back to you shortly.",
                });
                setName('');
                setEmail('');
                setMessage('');
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send your message. Please try again later.",
            });
        } finally {
            setIsSending(false);
        }
    };

  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main className="p-4 sm:p-6 md:p-8">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="text-center">
                                    <LifeBuoy className="mx-auto h-12 w-12 text-primary mb-4" />
                                    <CardTitle className="text-2xl sm:text-3xl font-bold">Get in Touch</CardTitle>
                                    <CardDescription className="text-base">We'd love to hear from you. Send us a message using the form below.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Your Name</Label>
                                                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Your Email</Label>
                                                <Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea id="message" placeholder="How can we help you today?" value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isSending}>
                                            {isSending ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send className="mr-2 h-4 w-4" /> Send Message</>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>Reach out to us directly through these channels.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="flex items-center gap-4">
                                        <div className="p-3 bg-muted rounded-full">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">General Inquiries</p>
                                            <a href="mailto:support@example.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">support@example.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-muted rounded-full">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Phone Support</p>
                                            <a href="tel:+15555555555" className="text-sm text-muted-foreground hover:text-primary transition-colors">+1 (555) 555-5555</a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Follow Us</CardTitle>
                                    <CardDescription>Connect with us on social media.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-around">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href="https://twitter.com/your-profile" target="_blank"><Twitter className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href="https://linkedin.com/in/your-profile" target="_blank"><Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href="https://github.com/your-username" target="_blank"><Github className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
