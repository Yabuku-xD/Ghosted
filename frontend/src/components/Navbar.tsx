import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Calculator, 
  Menu, 
  X, 
  Scale, 
  BriefcaseBusiness,
  ChevronDown,
  Sparkles,
  Users,
  FileText,
  Target,
  BarChart3
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SkipLink from './ui/SkipLink';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Explore',
    icon: Building2,
    items: [
      { to: '/companies', label: 'Companies', icon: Building2, description: 'Browse H-1B sponsors' },
      { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness, description: 'Live job postings' },
      { to: '/compare', label: 'Compare', icon: Scale, description: 'Side-by-side analysis' },
    ]
  },
  {
    label: 'Insights',
    icon: BarChart3,
    items: [
      { to: '/offers', label: 'Salary Data', icon: TrendingUp, description: 'Compensation insights' },
      { to: '/predictions', label: 'Predictions', icon: Target, description: 'Sponsorship odds' },
    ]
  },
];

const standaloneLinks: NavItem[] = [
  { to: '/lottery-calculator', label: 'Calculator', icon: Calculator },
];

function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleDropdownEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <SkipLink targetId="main-content" />
      
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-bg-primary/80 backdrop-blur-2xl border-b border-white/5 shadow-lg' 
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
              aria-label="Ghosted - Home"
            >
              <motion.div 
                className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-cyan-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative font-bold text-xl sm:text-2xl text-white" aria-hidden="true">
                  G
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </motion.div>
              
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-lg text-text-primary tracking-tight">Ghosted</span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest -mt-0.5">Job Intelligence</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {/* Dropdown Groups */}
              {navGroups.map((group) => (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(group.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <motion.button
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeDropdown === group.label || group.items.some(item => isActive(item.to))
                        ? 'text-accent bg-accent/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-expanded={activeDropdown === group.label}
                    aria-haspopup="true"
                  >
                    <group.icon className="w-4 h-4" />
                    <span>{group.label}</span>
                    <motion.div
                      animate={{ rotate: activeDropdown === group.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {activeDropdown === group.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
                        style={{
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-cyan-500/5 pointer-events-none" />
                        
                        {group.items.map((item, index) => (
                          <motion.div
                            key={item.to}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={item.to}
                              className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive(item.to)
                                  ? 'bg-accent/10 text-accent'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                              }`}
                            >
                              <div className={`p-2 rounded-lg transition-colors ${
                                isActive(item.to) ? 'bg-accent/20' : 'bg-bg-tertiary group-hover:bg-bg-elevated'
                              }`}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-text-muted mt-0.5">{item.description}</div>
                                )}
                              </div>
                              {isActive(item.to) && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="w-1.5 h-1.5 rounded-full bg-accent mt-2"
                                />
                              )}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Standalone Links */}
              {standaloneLinks.map((link) => (
                <motion.div key={link.to} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={link.to}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive(link.to)
                        ? 'text-accent bg-accent/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                    }`}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Beta Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-xs font-medium text-accent">Beta</span>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-glass transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden border-t border-white/5 bg-bg-primary/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="container py-4 space-y-4">
                {/* Mobile Navigation Groups */}
                {navGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                      <group.icon className="w-3.5 h-3.5" />
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.to}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: groupIndex * 0.1 + itemIndex * 0.05 }}
                        >
                          <Link
                            to={item.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              isActive(item.to)
                                ? 'bg-accent/10 text-accent'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                            }`}
                            aria-current={isActive(item.to) ? 'page' : undefined}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {isActive(item.to) && (
                              <motion.div
                                layoutId="mobileActiveIndicator"
                                className="ml-auto w-2 h-2 rounded-full bg-accent"
                              />
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* Standalone Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-white/5"
                >
                  {standaloneLinks.map((link, index) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Link
                        to={link.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive(link.to)
                            ? 'bg-accent/10 text-accent'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                        }`}
                        aria-current={isActive(link.to) ? 'page' : undefined}
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mobile Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-muted"
                >
                  <div className="flex items-center gap-4">
                    <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
                    <Link to="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="text-accent">Beta</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  );
}

export default Navbar;
