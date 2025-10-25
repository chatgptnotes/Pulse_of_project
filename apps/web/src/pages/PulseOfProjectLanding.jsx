import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Zap, GitBranch, BarChart3, Users, Shield,
  ArrowRight, Check, Star, TrendingUp, Clock, Target,
  Cpu, Cloud, Webhook, Bell, Download, Play,
  ChevronRight, Menu, X, Github, Linkedin, Twitter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PulseOfProjectLanding = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Progress Tracking",
      description: "Automatic updates from Git commits, PRs, and deployments"
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Multi-Platform Integration",
      description: "Connect GitHub, GitLab, Jira, Slack, and more"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "KPI dashboards, velocity tracking, and predictive insights"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Client Portal",
      description: "Secure, read-only access for stakeholders"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "AI-Powered Automation",
      description: "Smart rules that update progress based on your workflow"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "SOC2 compliant with role-based access control"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: 49,
      description: "Perfect for small teams",
      features: [
        "1 Project",
        "5 Team Members",
        "Basic Integrations",
        "Weekly Reports",
        "Email Support"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: 149,
      description: "For growing businesses",
      features: [
        "5 Projects",
        "25 Team Members",
        "All Integrations",
        "Daily Reports",
        "API Access",
        "Priority Support"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored for your needs",
      features: [
        "Unlimited Projects",
        "Unlimited Users",
        "White-Label Option",
        "Custom Integrations",
        "24/7 Support",
        "Dedicated Account Manager"
      ],
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sweta Adatia",
      role: "CEO, Limitless Brain Wellness",
      content: "PulseOfProject transformed how we track our NeuroSense360 development. The real-time updates keep all stakeholders aligned.",
      rating: 5,
      image: "👨‍⚕️"
    },
    {
      name: "Sarah Chen",
      role: "CTO, TechStart Inc",
      content: "The automatic progress tracking saves us hours every week. Our clients love the transparency.",
      rating: 5,
      image: "👩‍💻"
    },
    {
      name: "Michael Roberts",
      role: "Project Manager, Enterprise Corp",
      content: "Managing 45+ projects has never been easier. The priority system and filters are game-changers.",
      rating: 5,
      image: "👨‍💼"
    }
  ];

  const stats = [
    { value: "45+", label: "Active Projects" },
    { value: "98%", label: "Automation Rate" },
    { value: "2.5x", label: "Faster Updates" },
    { value: "24/7", label: "Real-time Sync" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">PulseOfProject</span>
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                A Bettroi Product
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">Testimonials</a>
              <button
                onClick={() => navigate('/pulse')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Demo
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              <a href="#features" className="block py-2 text-gray-600">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-600">How it Works</a>
              <a href="#pricing" className="block py-2 text-gray-600">Pricing</a>
              <a href="#testimonials" className="block py-2 text-gray-600">Testimonials</a>
              <button
                onClick={() => navigate('/pulse')}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Try Demo
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                🚀 A Bettroi Product
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Feel the <span className="text-indigo-600">Heartbeat</span> of Your Projects
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Real-time project intelligence that keeps your finger on the pulse of progress.
              Automatic tracking, instant updates, complete transparency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/pulse')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Live Demo
              </button>
              <button className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                Schedule Demo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 p-8 bg-white rounded-2xl shadow-xl">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Track Projects
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features that work together seamlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How PulseOfProject Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in minutes, see results immediately
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Tools</h3>
              <p className="text-gray-600">
                Link GitHub, GitLab, Jira, and other tools with one-click authentication
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Set Up Projects</h3>
              <p className="text-gray-600">
                Create milestones, define KPIs, and configure automation rules
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Watch It Work</h3>
              <p className="text-gray-600">
                Progress updates automatically as your team works. No manual input needed.
              </p>
            </motion.div>
          </div>

          {/* Interactive Demo */}
          <div className="mt-20 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">See It In Action</h3>
                <p className="text-gray-600 mb-6">
                  Watch how commits automatically update progress, PRs trigger milestone updates,
                  and deployments complete phases.
                </p>

                <div className="flex gap-2 mb-6">
                  {['realtime', 'integrations', 'analytics'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                        activeTab === tab
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'realtime' && (
                    <motion.div
                      key="realtime"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <GitBranch className="w-5 h-5 text-green-600" />
                        <span className="text-sm">feat: User authentication → +25% progress</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Check className="w-5 h-5 text-blue-600" />
                        <span className="text-sm">PR #42 merged → Milestone 75% complete</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span className="text-sm">Deployed to production → Phase completed</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Project Progress</h4>
                    <span className="text-2xl font-bold text-indigo-600">75%</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phase 1: Foundation</span>
                        <span className="text-green-600">Complete</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phase 2: Development</span>
                        <span className="text-blue-600">75%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <motion.div
                          initial={{ width: '60%' }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1 }}
                          className="h-2 bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Phase 3: Testing</span>
                        <span className="text-gray-400">Pending</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your team size and needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-xl p-8 ${
                  plan.highlighted
                    ? 'ring-2 ring-indigo-600 shadow-xl scale-105'
                    : 'shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold">{plan.price}</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-3xl">{testimonials[currentTestimonial].image}</div>
                  <div>
                    <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                    <p className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentTestimonial ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Feel the Pulse?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of teams already using PulseOfProject to track progress automatically
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/pulse')}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all">
              Book a Demo
            </button>
          </div>
          <p className="text-sm text-white/80 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-8 h-8 text-indigo-400" />
                <span className="text-xl font-bold">PulseOfProject</span>
              </div>
              <p className="text-gray-400 text-sm">
                Real-time project intelligence platform
              </p>
              <div className="flex gap-4 mt-4">
                <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 PulseOfProject.com by BettRoi Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PulseOfProjectLanding;