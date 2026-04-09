'use client';

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Menu, X, LogOut, BarChart3, MessageSquare, Send, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

// Types
interface Review {
  id: string;
  date: string;
  customer: string;
  platform: 'Google' | 'Yelp' | 'Facebook';
  rating: number;
  text: string;
  status: 'Pending' | 'Responded';
  aiDraft?: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'SMS' | 'Email';
  sentCount: number;
  responseRate: number;
  createdAt: string;
}

interface User {
  id: string;
  businessName: string;
  email: string;
}

// Mock data
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    date: '2026-04-08',
    customer: 'Sarah Johnson',
    platform: 'Google',
    rating: 5,
    text: 'Fantastic service! The team was professional and responsive. Highly recommend.',
    status: 'Responded',
    aiDraft: 'Thank you Sarah for your kind words! We appreciate your business and look forward to serving you again.',
  },
  {
    id: '2',
    date: '2026-04-07',
    customer: 'Michael Chen',
    platform: 'Yelp',
    rating: 4,
    text: 'Great experience overall. The only issue was a slight wait time, but the quality made up for it.',
    status: 'Pending',
    aiDraft: 'Thank you Michael! We appreciate your feedback about the wait time - we\'re continuously working to improve our efficiency.',
  },
  {
    id: '3',
    date: '2026-04-06',
    customer: 'Emma Rodriguez',
    platform: 'Facebook',
    rating: 5,
    text: 'Best experience I\'ve had! Will definitely be coming back.',
    status: 'Pending',
    aiDraft: 'We\'re thrilled to hear that Emma! Your satisfaction is our priority.',
  },
  {
    id: '4',
    date: '2026-04-05',
    customer: 'David Smith',
    platform: 'Google',
    rating: 3,
    text: 'Decent service but could be better. Staff was friendly but seemed a bit unprepared.',
    status: 'Responded',
    aiDraft: 'Thank you for your feedback David. We appreciate your candor and are working to improve our team preparation.',
  },
  {
    id: '5',
    date: '2026-04-04',
    customer: 'Jessica Lee',
    platform: 'Yelp',
    rating: 5,
    text: 'Excellent! Everything was perfect from start to finish.',
    status: 'Responded',
    aiDraft: 'Thank you Jessica! We\'re so glad we could provide you with an excellent experience.',
  },
  {
    id: '6',
    date: '2026-04-03',
    customer: 'Robert Taylor',
    platform: 'Facebook',
    rating: 2,
    text: 'Disappointed with the quality. Not what I expected based on other reviews.',
    status: 'Pending',
    aiDraft: 'We\'re sorry to hear you were disappointed Robert. We\'d love the chance to make things right.',
  },
  {
    id: '7',
    date: '2026-04-02',
    customer: 'Amanda White',
    platform: 'Google',
    rating: 5,
    text: 'Outstanding! Will recommend to all my friends and family.',
    status: 'Responded',
    aiDraft: 'Thank you Amanda for the referral! We truly appreciate your support.',
  },
  {
    id: '8',
    date: '2026-04-01',
    customer: 'Chris Martinez',
    platform: 'Yelp',
    rating: 4,
    text: 'Good service, reasonable prices. Would come again.',
    status: 'Pending',
    aiDraft: 'Thank you for your business Chris! We look forward to your next visit.',
  },
  {
    id: '9',
    date: '2026-03-31',
    customer: 'Lauren Davis',
    platform: 'Facebook',
    rating: 5,
    text: 'Amazing experience! The attention to detail was incredible.',
    status: 'Responded',
    aiDraft: 'Thank you Lauren! We pride ourselves on attention to detail and customer satisfaction.',
  },
  {
    id: '10',
    date: '2026-03-30',
    customer: 'Kevin Anderson',
    platform: 'Google',
    rating: 4,
    text: 'Very satisfied! Minor issues but overall great.',
    status: 'Pending',
    aiDraft: 'Thank you Kevin! We\'re glad you\'re satisfied and appreciate your feedback on areas we can improve.',
  },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'SMS Welcome Campaign', type: 'SMS', sentCount: 145, responseRate: 28, createdAt: '2026-03-15' },
  { id: '2', name: 'Email Follow-up', type: 'Email', sentCount: 89, responseRate: 12, createdAt: '2026-03-20' },
  { id: '3', name: 'Google Review Request', type: 'Email', sentCount: 234, responseRate: 18, createdAt: '2026-03-25' },
];

// Chart data
const reviewsChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
  datasets: [
    {
      label: 'Reviews Received',
      data: [12, 19, 8, 15, 22, 18, 14],
      backgroundColor: '#001F4D',
      borderColor: '#001F4D',
      borderRadius: 4,
    },
  ],
};

const ratingDistributionData = {
  labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
  datasets: [
    {
      data: [45, 28, 15, 8, 4],
      backgroundColor: ['#001F4D', '#0A2D66', '#1A3A73', '#2A4780', '#3A548D'],
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
};

const responseTimeData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Avg Response Time (hours)',
      data: [2.4, 1.8, 2.1, 1.5, 2.9, 3.2, 2.7],
      borderColor: '#001F4D',
      backgroundColor: 'rgba(0, 31, 77, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#001F4D',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    },
  ],
};

// Landing Page Component
function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#001F4D] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-[#001F4D]">Rankwyre</span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-[#001F4D] transition">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-[#001F4D] transition">Pricing</a>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-[#001F4D] text-[#001F4D] hover:bg-[#001F4D] hover:text-white"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-[#001F4D] hover:bg-[#0A2D66]"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Features</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Pricing</a>
              <Button variant="outline" onClick={() => navigate('/login')} className="w-full border-[#001F4D] text-[#001F4D]">
                Login
              </Button>
              <Button onClick={() => navigate('/signup')} className="w-full bg-[#001F4D]">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-5xl sm:text-6xl font-bold text-[#001F4D] mb-6">
            Your Reputation.<br />Managed. Amplified.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Centralize review management across Google, Yelp, and Facebook. Get AI-powered response drafts, monitor reputation in real-time, and request reviews at scale.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/signup')} className="bg-[#001F4D] hover:bg-[#0A2D66] h-12 px-8 text-lg">
              Start Free Trial
            </Button>
            <Button variant="outline" className="h-12 px-8 text-lg border-[#001F4D] text-[#001F4D] hover:bg-[#001F4D] hover:text-white">
              Book Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#001F4D] mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage and amplify your reputation</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Review Monitoring', desc: 'Track all reviews across platforms in one dashboard' },
              { title: 'AI Response Drafts', desc: 'Let AI help craft thoughtful responses instantly' },
              { title: 'Review Campaigns', desc: 'Send SMS and email campaigns to request reviews' },
              { title: 'Analytics Dashboard', desc: 'Visualize trends, ratings, and response metrics' },
              { title: 'Multi-Platform Support', desc: 'Manage Google, Yelp, and Facebook reviews' },
              { title: 'Automated Alerts', desc: 'Get notified of new reviews in real-time' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card className="p-8 hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold text-[#001F4D] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#001F4D] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your business</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$99',
                features: ['1 location', 'Google reviews', 'Basic analytics', 'Email support'],
              },
              {
                name: 'Professional',
                price: '$199',
                features: ['Up to 5 locations', 'Google + Yelp', 'AI responses', 'SMS campaigns', 'Priority support'],
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: ['Unlimited locations', 'All platforms', 'Custom integrations', 'Dedicated support'],
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className={`p-8 ${plan.highlighted ? 'ring-2 ring-[#001F4D] shadow-xl' : ''}`}>
                  <h3 className="text-2xl font-bold text-[#001F4D] mb-2">{plan.name}</h3>
                  <p className="text-4xl font-bold mb-6">
                    {plan.price}
                    <span className="text-lg text-gray-600">/mo</span>
                  </p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-[#001F4D] rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.highlighted ? 'bg-[#001F4D] hover:bg-[#0A2D66]' : 'border-[#001F4D] text-[#001F4D]'}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001F4D] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 Rankwyre Inc. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}

// Auth Pages
function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user: User = {
        id: '1',
        businessName: formData.businessName,
        email: formData.email,
      };
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Account created successfully!');
      navigate('/dashboard/overview');
      setLoading(false);
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br from-[#001F4D] to-[#0A2D66] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#001F4D] flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#001F4D]">Rankwyre</span>
          </div>

          <h1 className="text-2xl font-bold text-[#001F4D] mb-2">Create Account</h1>
          <p className="text-gray-600 mb-6">Join thousands of businesses managing their reputation</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="text-gray-700">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Your Business"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#001F4D] hover:bg-[#0A2D66]"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-[#001F4D] font-semibold hover:underline">
              Login
            </button>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user: User = {
        id: '1',
        businessName: 'Demo Business',
        email: formData.email,
      };
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Logged in successfully!');
      navigate('/dashboard/overview');
      setLoading(false);
    }, 800);
  };

  const handleDemoLogin = () => {
    const user: User = {
      id: '1',
      businessName: 'Demo Business',
      email: 'demo@rankwyre.com',
    };
    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Demo mode activated!');
    navigate('/dashboard/overview');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br from-[#001F4D] to-[#0A2D66] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#001F4D] flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#001F4D]">Rankwyre</span>
          </div>

          <h1 className="text-2xl font-bold text-[#001F4D] mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-6">Sign in to your reputation management dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#001F4D] hover:bg-[#0A2D66]"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Separator className="my-4" />

          <Button
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full border-[#001F4D] text-[#001F4D] hover:bg-[#001F4D] hover:text-white"
          >
            Try Demo Credentials
          </Button>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-[#001F4D] font-semibold hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// Dashboard Components
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    toast.success('Logged out successfully!');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard/overview', icon: BarChart3 },
    { label: 'Reviews', path: '/dashboard/reviews', icon: MessageSquare },
    { label: 'Campaigns', path: '/dashboard/campaigns', icon: Send },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#001F4D] text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[#001F4D]" />
            </div>
            <span className="font-bold text-lg">Rankwyre</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive ? 'bg-white text-[#001F4D]' : 'text-gray-100 hover:bg-[#0A2D66]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <Separator className="my-8 bg-white/20" />

          <div className="space-y-2">
            <p className="text-sm text-gray-300">{user?.businessName}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-4 text-white border-white hover:bg-white hover:text-[#001F4D]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 hover:text-[#001F4D] transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Pages
function OverviewPage() {
  const stats = [
    { label: 'Total Reviews', value: '342', change: '+12 this week' },
    { label: 'Average Rating', value: '4.6', change: '+0.2 this month' },
    { label: 'Response Rate', value: '78%', change: '+5% improvement' },
    { label: 'Pending Reviews', value: '14', change: '4 new today' },
  ];

  const recentReviews = MOCK_REVIEWS.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-[#001F4D] mb-8">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-[#001F4D] mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Reviews */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[#001F4D] mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start justify-between pb-4 border-b last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{review.customer}</span>
                    <Badge variant="outline" className="text-xs">{review.platform}</Badge>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.text.substring(0, 100)}...</p>
                </div>
                <Badge className={`ml-4 ${review.status === 'Responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {review.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const filteredReviews = reviews.filter(review => {
    const platformMatch = platformFilter === 'All' || review.platform === platformFilter;
    const ratingMatch = ratingFilter === 'All' || review.rating === parseInt(ratingFilter);
    return platformMatch && ratingMatch;
  });

  const handleRespond = (reviewId: string, response: string) => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'Responded' as const } : r));
    setSelectedReview(null);
    toast.success('Response sent successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-[#001F4D] mb-8">Reviews</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Platforms</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Yelp">Yelp</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Platform</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600">{review.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{review.customer}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{review.platform}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={review.status === 'Responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {review.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                            className="text-[#001F4D] border-[#001F4D] hover:bg-[#001F4D] hover:text-white"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#001F4D]">Review from {selectedReview?.customer}</DialogTitle>
                          </DialogHeader>
                          {selectedReview && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Customer Review:</p>
                                <p className="text-gray-900 p-3 bg-gray-50 rounded">{selectedReview.text}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">AI-Generated Response:</p>
                                <p className="text-gray-900 p-3 bg-blue-50 rounded">{selectedReview.aiDraft}</p>
                              </div>
                              {selectedReview.status === 'Pending' && (
                                <Button
                                  onClick={() => handleRespond(selectedReview.id, selectedReview.aiDraft || '')}
                                  className="w-full bg-[#001F4D] hover:bg-[#0A2D66]"
                                >
                                  Send Response
                                </Button>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'SMS' });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: Campaign = {
      id: (campaigns.length + 1).toString(),
      name: formData.name,
      type: formData.type as 'SMS' | 'Email',
      sentCount: 0,
      responseRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns([...campaigns, newCampaign]);
    setFormData({ name: '', type: 'SMS' });
    setNewCampaignOpen(false);
    toast.success('Campaign created successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#001F4D]">Campaigns</h1>
          <Dialog open={newCampaignOpen} onOpenChange={setNewCampaignOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#001F4D] hover:bg-[#0A2D66]">New Campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[#001F4D]">Create New Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <Label htmlFor="campaignName" className="text-gray-700">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g., Summer Review Push"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="campaignType" className="text-gray-700">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#001F4D] hover:bg-[#0A2D66]">
                  Create Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{campaign.type} Campaign</p>
                  </div>
                  <Badge variant="outline">{campaign.type}</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Sent Count</p>
                    <p className="text-2xl font-bold text-[#001F4D]">{campaign.sentCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Response Rate</p>
                    <Progress value={campaign.responseRate} className="h-2" />
                    <p className="text-sm font-semibold text-gray-900 mt-1">{campaign.responseRate}%</p>
                  </div>
                  <p className="text-xs text-gray-500 pt-2 border-t">Created {campaign.createdAt}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-[#001F4D] mb-8">Analytics</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#001F4D] mb-4">Reviews Over Time</h2>
            <Bar data={reviewsChartData} options={{ maintainAspectRatio: true }} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#001F4D] mb-4">Rating Distribution</h2>
            <Pie data={ratingDistributionData} options={{ maintainAspectRatio: true }} />
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[#001F4D] mb-4">Response Time Trend</h2>
          <Line data={responseTimeData} options={{ maintainAspectRatio: false }} />
        </Card>
      </motion.div>
    </div>
  );
}

function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState({
    newReviews: true,
    weeklyDigest: true,
    lowRatings: true,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success('Notification settings updated!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-[#001F4D] mb-8">Settings</h1>

        <div className="max-w-2xl space-y-6">
          {/* Business Profile */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#001F4D] mb-4">Business Profile</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Business Name</Label>
                <Input value={user?.businessName} readOnly className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label className="text-gray-700">Email</Label>
                <Input value={user?.email} readOnly className="mt-1 bg-gray-50" />
              </div>
              <Button className="bg-[#001F4D] hover:bg-[#0A2D66]">Update Profile</Button>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#001F4D] mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">New Reviews</p>
                  <p className="text-sm text-gray-600">Get notified when new reviews come in</p>
                </div>
                <Switch
                  checked={notifications.newReviews}
                  onCheckedChange={() => handleNotificationChange('newReviews')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Weekly Digest</p>
                  <p className="text-sm text-gray-600">Receive a weekly summary of your reviews</p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={() => handleNotificationChange('weeklyDigest')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Low Rating Alerts</p>
                  <p className="text-sm text-gray-600">Alert me about 1-2 star reviews</p>
                </div>
                <Switch
                  checked={notifications.lowRatings}
                  onCheckedChange={() => handleNotificationChange('lowRatings')}
                />
              </div>
            </div>
          </Card>

          {/* Connected Platforms */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#001F4D] mb-4">Connected Platforms</h2>
            <div className="space-y-3">
              {['Google', 'Yelp', 'Facebook'].map((platform) => (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{platform}</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/overview" element={<DashboardLayout><OverviewPage /></DashboardLayout>} />
        <Route path="/dashboard/reviews" element={<DashboardLayout><ReviewsPage /></DashboardLayout>} />
        <Route path="/dashboard/campaigns" element={<DashboardLayout><CampaignsPage /></DashboardLayout>} />
        <Route path="/dashboard/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}
