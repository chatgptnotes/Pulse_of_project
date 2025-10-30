import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Users, Zap, ArrowRight, LogIn } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">PulseOfProject</span>
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                by Bettroi
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Projects
            <br />
            <span className="text-indigo-600">In Real-Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage bugs, track progress, and collaborate with your team all in one place.
            Simple, powerful, and built for modern teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/admin')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg font-medium"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all text-lg font-medium"
            >
              Learn More
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Tracking</h3>
              <p className="text-gray-600">Visual Gantt charts and milestones</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Bug Tracking</h3>
              <p className="text-gray-600">Track and resolve issues quickly</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Real-time chat and updates</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Live Progress</h3>
              <p className="text-gray-600">Real-time project status</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features to manage your projects effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Project Tracking</h3>
              <p className="text-gray-600">
                Beautiful Gantt charts and timeline views to visualize your project progress.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bug Management</h3>
              <p className="text-gray-600">
                Track bugs, assign priorities, and monitor resolution progress in real-time.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Built-in chat, comments, and file sharing to keep your team connected.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                See changes as they happen with live synchronization across all devices.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Portal</h3>
              <p className="text-gray-600">
                Share progress with clients through secure, shareable links.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Authentication</h3>
              <p className="text-gray-600">
                Easy login and access control with role-based permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start tracking your projects today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/admin')}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 text-lg font-medium"
            >
              Start Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all text-lg font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Activity className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold">PulseOfProject</span>
              <span className="text-sm text-gray-400">by Bettroi Solutions</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 PulseOfProject. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
