

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

// Define styles as objects for cleaner JSX
const styles = {
  header: {
    position: 'fixed',
    top: 0,
    width: '100%',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    padding: '1rem 0',
    transition: 'all 0.3s ease',
  },
  hero: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
  },
  featureIcon: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  ctaSection: {
    padding: '6rem 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textAlign: 'center',
    color: 'white',
  },
  aboutSection: {
    padding: '6rem 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textAlign: 'center',
    color: 'white',
  },
};

const FeatureCard = ({ icon, title, text }: { icon: string, title: string, text: string }) => (
  <div className="feature-card bg-white p-10 rounded-2xl shadow-lg transition-all duration-300 ease-in-out text-center hover:-translate-y-2 hover:shadow-2xl">
    <div style={styles.featureIcon} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-white">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{text}</p>
  </div>
);

export default function WelcomePage() {
  useEffect(() => {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') as string);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Header scroll effect
    const handleScroll = () => {
      const header = document.querySelector('.header') as HTMLElement;
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.98)';
          header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
          header.style.boxShadow = 'none';
        }
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Animate feature cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
      observer.observe(card);
    });
    
    // Interactive exam preview
    document.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', function() {
        this.parentElement?.querySelectorAll('.option').forEach(opt => {
          (opt as HTMLElement).classList.remove('selected');
        });
        this.classList.add('selected');
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Quizify - AI-Powered CBT Exam Platform</title>
        <style>{`
          .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          .slide-in-left { animation: slideInLeft 1s ease-out both; }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
          .slide-in-right { animation: slideInRight 1s ease-out 0.3s both; }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
          .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
            background-size: cover;
            opacity: 0.1;
          }
          .option.selected {
             border-color: #667eea;
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             color: white;
          }
        `}</style>
      </Head>
      <div className="text-gray-800 antialiased">
        {/* Header */}
        <header style={styles.header} className="header">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8">
            <div style={styles.logo} className="text-2xl sm:text-3xl font-bold">Quizify</div>
            <nav className="hidden md:flex">
              <ul className="flex list-none gap-8">
                <li><Link href="#features" className="font-medium hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="#about" className="font-medium hover:text-blue-600 transition-colors">About</Link></li>
              </ul>
            </nav>
            <div className="flex gap-2 sm:gap-4">
              <Link href="/login" style={styles.btnSecondary} className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base hover:bg-blue-50">Login</Link>
              <Link href="/login" style={styles.btnPrimary} className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm sm:text-base">Get Started</Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero} className="hero p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 grid md:grid-cols-2 gap-8 md:gap-16 items-center z-10">
            <div className="hero-text text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight slide-in-left">Transform PDFs into Smart Exams</h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 slide-in-left" style={{ animationDelay: '0.2s' }}>Upload your question papers and instantly create professional CBT exams with AI-powered answer prediction, detailed analytics, and a seamless exam experience.</p>
              <div className="flex gap-2 sm:gap-4 justify-center md:justify-start flex-col sm:flex-row slide-in-left" style={{ animationDelay: '0.4s' }}>
                <Link href="/login" style={styles.btnPrimary} className="px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">Get Started</Link>
                <Link href="#" className="px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold text-white border-2 border-white transition-all duration-300 hover:bg-white/10">Watch Demo</Link>
              </div>
            </div>
            <div className="hero-visual flex justify-center items-center slide-in-right">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl w-full max-w-sm transition-transform duration-300 ease-out" style={{ transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)' }}>
                <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-gray-800 text-base sm:text-lg font-semibold">Physics Mock Test</h3>
                  <div className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm">45:30</div>
                </div>
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-gray-800 mb-2 font-medium text-sm sm:text-base">Question 15 of 50</h4>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">What is the acceleration due to gravity on Earth?</p>
                  <div className="grid gap-3">
                    <div className="option p-3 bg-gray-100 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-300 text-sm hover:border-blue-500 hover:bg-blue-50">A) 8.9 m/s²</div>
                    <div className="option p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-sm hover:border-blue-500 hover:bg-blue-50">B) 9.8 m/s²</div>
                    <div className="option p-3 bg-gray-100 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-300 text-sm hover:border-blue-500 hover:bg-blue-50">C) 10.2 m/s²</div>
                    <div className="option p-3 bg-gray-100 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-300 text-sm hover:border-blue-500 hover:bg-blue-50">D) 11.5 m/s²</div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <button className="px-4 py-2 border-none bg-blue-600 text-white rounded-md cursor-pointer text-sm">Previous</button>
                  <button className="px-4 py-2 border-none bg-green-500 text-white rounded-md cursor-pointer text-sm">Save & Next</button>
                  <button className="px-4 py-2 border-none bg-yellow-400 text-gray-800 rounded-md cursor-pointer text-sm">Bookmark</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-gray-50" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">Everything you need to create, manage, and analyze computer-based tests with AI assistance.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon="📄" title="Smart PDF Parsing" text="Upload question papers in PDF format. Our AI automatically extracts questions, options, and images with high accuracy." />
              <FeatureCard icon="🤖" title="AI Answer Prediction" text="No answer key? No problem. Our AI predicts correct answers with confidence scores and generates detailed explanations." />
              <FeatureCard icon="⏱️" title="CBT Environment" text="Professional exam interface with timer, navigation controls, question bookmarking, and secure submission process." />
              <FeatureCard icon="📊" title="Detailed Analytics" text="Comprehensive reports with scores, sectional analysis, performance graphs, and personalized insights." />
              <FeatureCard icon="🎯" title="Multiple Modes" text="Practice mode with instant feedback, strict exam mode, and adaptive difficulty based on performance." />
              <FeatureCard icon="👥" title="Admin Dashboard" text="Manage users, approve AI-parsed questions, set exam parameters, and monitor student progress." />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section style={styles.aboutSection} className="py-16 sm:py-24" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Practice Smarter, Not Harder</h2>
              <p className="text-base sm:text-lg text-white/90 max-w-3xl mx-auto">Our mission is to empower students with the tools they need to excel.</p>
            </div>
            <div className="max-w-4xl mx-auto text-center text-lg text-white/95 leading-relaxed space-y-6">
                <p>
                    Studying for exams can be tough. Juggling textbooks, notes, and old question papers is overwhelming. That’s where Quizify steps in. We built this platform to simplify your exam preparation, turning static materials into dynamic practice sessions. Our goal is to help you focus on what truly matters: understanding the material and mastering your subjects.
                </p>
                <p>
                    With Quizify, you can instantly convert any PDF question paper into an interactive online exam. Get immediate scores, track your progress over time, and gain personalized insights to identify your strengths and weaknesses. Stop guessing and start practicing with purpose. Upload your first PDF and start practicing today!
                </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section style={styles.ctaSection} className="px-4 py-24">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Exams?</h2>
            <p className="text-lg sm:text-xl mb-8 opacity-90">Join thousands of educators and students who trust Quizify for their testing needs</p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link href="/login" className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 bg-white text-blue-600 hover:shadow-lg">Get Started</Link>
              <Link href="#" className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:bg-white/10 border-2 border-white">Schedule Demo</Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Product</h3>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">Features</Link>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">Pricing</Link>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">Integrations</Link>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Support</h3>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">Help Center</Link>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">Contact Us</Link>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">System Status</Link>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Company</h3>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">About Us</Link>
                <Link href="/login" className="block mb-2 text-gray-400 hover:text-white transition">Privacy Policy</Link>
                <Link href="/login" className="block mb-2 text-gray-400 hover:text-white transition">Terms of Service</Link>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Connect</h3>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">Twitter</Link>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">LinkedIn</Link>
                <Link href="#" className="block mb-2 text-gray-400 hover:text-white transition">GitHub</Link>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-gray-700 text-gray-500">
              <p>&copy; 2025 Quizify. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
