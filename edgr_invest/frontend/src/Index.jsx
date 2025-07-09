import { useState } from 'react';
import { ArrowRight, TrendingUp, Users, Shield, Globe, Mail, Phone, MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import alImage from './assets/edgr_pic_al.jpg';
import danImage from './assets/edgr_pic_dan.jpg';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const services = [
    {
      icon: TrendingUp,
      title: "Investment Management",
      description: "Index Fund portfolio management."
    },
    {
      icon: Users,
      title: "Wealth Advisory",
      description: "Strategic wealth planning and advisory services for high-net-worth individuals and families."
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Advanced risk assessment and mitigation strategies to protect and grow your investments."
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access to international investment opportunities and global market insights."
    }
  ];

  const team = [
    {
      name: "Al",
      role: "Co-Founder",
      image: alImage
    },
    {
      name: "Dan",
      role: "Co-Founder",
      image: danImage
    }
  ];


  const handleClientPortalClick = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-md z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-white">
                EDGR Invest
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-300 hover:text-blue-400 transition-colors">About</a>
              <a href="#services" className="text-gray-300 hover:text-blue-400 transition-colors">Services</a>
              <a href="#team" className="text-gray-300 hover:text-blue-400 transition-colors">Team</a>
              <a href="#contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</a>
              <Button className="bg-gradient-to-r from-blue-800 to-blue-900 text-white hover:from-blue-700 hover:to-blue-800 border border-blue-600" onClick={handleClientPortalClick}>
                Client Portal
              </Button>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-black border-t border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">About</a>
              <a href="#services" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Services</a>
              <a href="#team" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Team</a>
              <a href="#contact" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">Contact</a>
              <div className="px-3 py-2">
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white hover:from-blue-700 hover:to-blue-800 border border-blue-600" onClick={handleClientPortalClick}>
                  Client Portal
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-blue-950"></div>
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop"
            alt="Financial technology background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Elevating Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Investment Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in">
                At EDGR Invest, we fuse decades of market data with cutting-edge innovation, strategic insight, and rigorous analysis to deliver secure and exceptional returns for our clients.             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 text-lg px-8 py-4 shadow-lg shadow-blue-900/50" onClick={handleClientPortalClick}>
                Client Portal <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl transform -rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop"
                alt="Modern office workspace"
                className="relative rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full opacity-80"></div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Building Wealth Through
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Strategic Investment</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                The first and only truly independent sports index fund—built to perform, shielded from the volatility of external market trends.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-4 bg-white rounded-lg border-l-4 border-blue-600 shadow-sm">
                  <div className="text-3xl font-bold text-blue-800 mb-2">$100k+</div>
                  <div className="text-gray-600">Assets Under Management</div>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-blue-600 shadow-sm">
                  <div className="text-3xl font-bold text-blue-800 mb-2">50+</div>
                  <div className="text-gray-600">Years of Industry Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-black text-white relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800/30 rounded-full blur-2xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Investment Services</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive investment solutions tailored to meet your unique financial objectives and risk profile.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-900 border-slate-700 text-white hover:border-blue-500">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-900/50">
                    <service.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-300">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Large Image Section */}
      <section className="py-0 bg-black">
        <div className="w-full h-96 md:h-[600px] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=600&fit=crop"
            alt="Professional meeting"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-blue-900/40 to-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-3xl md:text-5xl font-bold mb-4">Trusted by Industry Leaders</h3>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto px-4">
                Our clients trust us with their most important financial decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Leadership Team</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experienced professionals who guide our investment strategies and client relationships.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    <p className="text-lg text-blue-200">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-black text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-blue-950"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Your Investment Journey</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to take control of your financial future? Contact our team to discuss your investment goals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
                <Phone className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
                <Mail className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-300">info@edgrinvest.com</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
                <MapPin className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Office</h3>
              <p className="text-gray-300">New York, NY</p>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 text-lg px-12 py-4 shadow-lg shadow-blue-900/50">
              Schedule a Consultation <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-white mb-4">EDGR Invest</div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mb-4"></div>
              <p className="text-gray-400 mb-6 max-w-md">
                A premier investment management firm dedicated to helping our clients achieve their financial goals through disciplined, research-driven investment strategies.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Investment Management</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Wealth Advisory</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Risk Management</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Global Markets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 EDGR Invest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;