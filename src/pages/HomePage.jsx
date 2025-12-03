import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Database, CloudCog, Rocket, ArrowRight, Building2, Server, Shield, DollarSign } from 'lucide-react';
import ImageWithFallback from '../components/common/ImageWithFallback';
import HomeLayout from '../components/layout/HomeLayout';
import useAuth from '../hooks/useAuth';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('invest');
  const { isAuthenticated } = useAuth();

  const raiseCategories = [
    {
      icon: Database,
      title: 'Data Centers',
      description: 'Raise for infrastructure projects',
      color: '#e6c79d'
    },
    {
      icon: Server,
      title: 'Servers/GPUs',
      description: 'List hardware assets',
      color: '#e6c79d'
    },
    {
      icon: CloudCog,
      title: 'VM Pools',
      description: 'Offer compute capacity',
      color: '#e6c79d'
    },
    {
      icon: Rocket,
      title: 'Startups',
      description: 'Launch venture campaigns',
      color: '#e6c79d'
    }
  ];

  const stats = [
    { value: '$12M+', label: 'Capital Raised' },
    { value: '45+', label: 'Active Projects' },
    { value: '2,500+', label: 'Investors' },
    { value: '15%', label: 'Avg. Returns' }
  ];

  const handleNavigateToInvestments = () => {
    navigate('/investments/products');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <HomeLayout>
      <div className="bg-gradient-to-b from-purple-900 to-purple-800">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1757421392324-cc071fb8b644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZGF0YSUyMGNlbnRlciUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzY0NDI5NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="African Tech Infrastructure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/95 via-purple-900/85 to-purple-900/70"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-8 lg:px-12 py-32 w-full">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-purple-900/60 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-2">
              <button
                onClick={() => setActiveTab('invest')}
                className={`px-8 py-4 rounded-lg transition-all text-lg ${
                  activeTab === 'invest'
                    ? 'bg-yellow-400 text-purple-900'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Investments
              </button>
              <button
                onClick={() => setActiveTab('raise')}
                className={`px-8 py-4 rounded-lg transition-all text-lg ${
                  activeTab === 'raise'
                    ? 'bg-yellow-400 text-purple-900'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                For Businesses
              </button>
            </div>
          </div>

          {/* Investments Tab Content */}
          {activeTab === 'invest' && (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-6 py-3 bg-yellow-400/20 border border-yellow-400/30 rounded-full mb-8">
                  <span className="text-yellow-400">Infrastructure Investing for Africa</span>
                </div>
                <h1 className="text-white mb-6 text-5xl lg:text-6xl font-bold">
                  Invest in African Tech Infrastructure
                </h1>
                <p className="text-white/80 text-xl mb-10 leading-relaxed">
                  Fund data centers, compute nodes, and innovative startups building Africa's digital future. Earn returns while powering growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button 
                    onClick={handleNavigateToInvestments}
                    className="px-10 py-5 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg font-semibold"
                  >
                    Browse Investments
                    <ArrowRight className="w-6 h-6" />
                  </button>
                  <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all text-lg">
                    How It Works
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {isAuthenticated ? (
                    <>
                      <button 
                        onClick={handleNavigateToDashboard}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                      >
                        Go to Dashboard
                      </button>
                      <span className="text-white/40">|</span>
                      <p className="text-yellow-400/80">
                        Welcome back!
                      </p>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleNavigateToRegister}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                      >
                        Sign Up
                      </button>
                      <button 
                        onClick={handleNavigateToLogin}
                        className="px-6 py-3 bg-transparent text-white/80 hover:text-white transition-all"
                      >
                        Login
                      </button>
                      <span className="text-white/40">|</span>
                      <p className="text-yellow-400/80">
                        Join 2,500+ investors
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-purple-900/60 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-8">
                  <h3 className="text-white mb-6 text-2xl">Platform Highlights</h3>
                  <div className="space-y-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between py-4 border-b border-yellow-400/20 last:border-0">
                        <span className="text-white/70 text-lg">{stat.label}</span>
                        <span className="text-yellow-400 text-2xl font-bold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* For Businesses Tab Content */}
          {activeTab === 'raise' && (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-6 py-3 bg-yellow-400/20 border border-yellow-400/30 rounded-full mb-8">
                  <span className="text-yellow-400">Raise Capital on Africa Investment Platform</span>
                </div>
                <h1 className="text-white mb-6 text-5xl lg:text-6xl font-bold">
                  Raise up to $100k on Our Platform
                </h1>
                <p className="text-white/80 text-xl mb-10 leading-relaxed">
                  Now with our platform you can raise from your community of online followers, customers, friends, family, early stage investors, and more. <span className="text-yellow-400">Hundreds of investors— just one line item on your cap table.</span>
                </p>
                <div className="flex gap-4 mb-10">
                  <button 
                    onClick={handleNavigateToRegister}
                    className="px-10 py-5 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 text-lg font-semibold"
                  >
                    Apply to Raise
                    <ArrowRight className="w-6 h-6" />
                  </button>
                  <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all text-lg">
                    Learn More
                  </button>
                </div>
                <div className="space-y-4 text-white/70">
                  <p className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span>
                    Raise through <span className="text-white">SAFEnotes, Convertible Notes & Venture Debt</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span>
                    Industries: <span className="text-white">AI, Cloud, Digital Infrastructure, Fintech</span>
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-purple-900/60 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-8">
                  <h3 className="text-white mb-6 text-2xl">Why Businesses Choose Us</h3>
                  <div className="space-y-6">
                    <div className="py-4 border-b border-yellow-400/20">
                      <div className="text-yellow-400 mb-2 text-2xl font-bold">Up to $100k</div>
                      <div className="text-white/70">Maximum raise amount</div>
                    </div>
                    <div className="py-4 border-b border-yellow-400/20">
                      <div className="text-yellow-400 mb-2 text-2xl font-bold">One Line Item</div>
                      <div className="text-white/70">Simplified cap table</div>
                    </div>
                    <div className="py-4 border-b border-yellow-400/20">
                      <div className="text-yellow-400 mb-2 text-2xl font-bold">Your Community</div>
                      <div className="text-white/70">Customers as investors</div>
                    </div>
                    <div className="py-4">
                      <div className="text-yellow-400 mb-2 text-2xl font-bold">5-7 Days</div>
                      <div className="text-white/70">Review turnaround</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Stats Section - Only visible on mobile */}
      <section className="py-16 bg-purple-900/50 border-y border-yellow-400/20 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-yellow-400 mb-2 text-2xl font-bold">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-purple-900 to-purple-800">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-white mb-6 text-4xl lg:text-5xl font-bold">
              Why Invest with Us?
            </h2>
            <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
              Access exclusive opportunities in Africa's rapidly growing tech infrastructure market
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'High-Growth Market',
                description: 'Tap into Africa\'s expanding digital economy'
              },
              {
                icon: Shield,
                title: 'Vetted Opportunities',
                description: 'All projects thoroughly reviewed and verified'
              },
              {
                icon: DollarSign,
                title: 'Competitive Returns',
                description: '15% average returns across portfolio'
              },
              {
                icon: Building2,
                title: 'Diversified Portfolio',
                description: 'Invest across infrastructure & startups'
              }
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-purple-900/50 border border-yellow-400/20 rounded-xl p-8 hover:border-yellow-400/40 hover:shadow-2xl transition-all group"
                >
                  <div className="w-16 h-16 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 group-hover:scale-110 transition-all">
                    <Icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-white mb-3 text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-white/60">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-24 bg-purple-900">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 text-4xl font-bold">Businesses: Raise Capital from Your Community</h2>
            <p className="text-white/70 text-xl max-w-3xl mx-auto">Let your customers, users, and followers become investors. Thousands of investors, one line on your cap table.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {raiseCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="bg-purple-900/50 border border-yellow-400/20 rounded-xl p-8 hover:border-yellow-400/40 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 group-hover:scale-110 transition-all">
                    <Icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-white mb-3 text-xl font-semibold">{category.title}</h3>
                  <p className="text-white/60">{category.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-purple-900/50 border border-yellow-400/30 rounded-2xl p-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-yellow-400 text-xl mb-4 font-semibold">Funding Instruments</h3>
                <ul className="space-y-3 text-white/70 text-lg">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> SAFEnotes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> Convertible Notes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> Venture Debt
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-yellow-400 text-xl mb-4 font-semibold">Industries We Support</h3>
                <ul className="space-y-3 text-white/70 text-lg">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> AI & Machine Learning
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> Cloud Services
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> Digital Infrastructure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">•</span> Fintech
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center">
              <button 
                onClick={handleNavigateToRegister}
                className="px-10 py-5 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3 text-lg font-semibold"
              >
                Apply to Raise
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Categories */}
      <section className="py-24 bg-purple-800">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-white mb-6 text-4xl font-bold">Investment Opportunities</h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              Browse active fundraises across multiple categories
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { title: 'Data Center Funds', count: 12, image: 'https://images.unsplash.com/photo-1548544027-1a96c4c24c7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjByb29tJTIwaW5mcmFzdHJ1Y3R1cmV8ZW58MXx8fHwxNzY0NDI5NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080' },
              { title: 'Hardware Nodes', count: 24, image: 'https://images.unsplash.com/photo-1681770678332-3a190df72091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwaW5mcmFzdHJ1Y3R1cmUlMjB0ZWNofGVufDF8fHx8MTc2NDQyOTUzM3ww&ixlib=rb-4.1.0&q=80&w=1080' },
              { title: 'Venture Funding', count: 18, image: 'https://images.unsplash.com/photo-1616804827035-f4aa814c14ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY0MzM1MDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080' }
            ].map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={handleNavigateToInvestments}
              >
                <div className="relative h-80 rounded-xl overflow-hidden mb-6 border border-yellow-400/20 group-hover:border-yellow-400/40 transition-all">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white mb-2 text-2xl font-semibold">{category.title}</h3>
                    <p className="text-yellow-400 text-lg">{category.count} Active Opportunities</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-r from-purple-900 to-purple-800">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 text-center">
          <h2 className="text-white mb-8 text-5xl font-bold">Ready to get started?</h2>
          <p className="text-white/70 mb-12 max-w-3xl mx-auto text-xl leading-relaxed">
            Whether you're looking to invest in Africa's tech future or raise capital for your business, we're here to help.
          </p>
          <div className="flex justify-center gap-6">
            <button 
              onClick={handleNavigateToInvestments}
              className="px-12 py-6 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3 text-xl font-semibold"
            >
              Start Investing
              <ArrowRight className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNavigateToRegister}
              className="px-12 py-6 bg-transparent border-2 border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all inline-flex items-center gap-3 text-xl"
            >
              Apply to Raise
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>
      </div>
    </HomeLayout>
  );
}