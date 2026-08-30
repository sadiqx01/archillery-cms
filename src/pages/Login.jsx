import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Award } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-dark overflow-hidden font-inter">
      {/* Left side: Premium Architectural Showcase Banner (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-3/5 relative items-center p-16 select-none bg-[#001026] overflow-hidden">
        {/* Real Reference project image background */}
        <img 
          src="/about-hero.jpg" 
          alt="Architectural Construction Showcase" 
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#001026] via-[#001a40]/90 to-transparent z-10" />
        <div className="absolute inset-0 grid-bg-dark opacity-20 z-10 pointer-events-none" />

        <div className="relative z-20 max-w-xl space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider">
              <Award size={14} /> COREN Certified Enterprise Portal
            </span>
            <h1 className="font-outfit font-extrabold text-4xl xl:text-5xl text-white leading-tight tracking-wide">
              Engineering Trust, <br/>
              Structuring Integrity.
            </h1>
            <p className="text-brand-beige/60 text-sm xl:text-base leading-relaxed">
              Archillery Build Ltd CMS manages end-to-end FIDIC contract workflows, procurement logs, coordinate defect snags, and daily site operations.
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-white/80">
              <ShieldCheck size={16} className="text-green-400" />
              <span>Vetted Structural Audits</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-bold text-white/80">
              <ShieldCheck size={16} className="text-green-400" />
              <span>ISO 9001:2015 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 relative z-20">
        {/* Mobile ambient lights */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-navy-light/10 blur-[120px] pointer-events-none lg:hidden" />
        
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Logo Header */}
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center justify-center bg-transparent p-0 mb-2">
              <img src="/logo.png" alt="Archillery Logo" className="h-16 w-auto object-contain" />
            </div>
            <div className="space-y-1">
              <h2 className="font-outfit font-extrabold text-2xl tracking-wide text-white md:text-3xl uppercase leading-none">
                ARCHILLERY CMS
              </h2>
              <span className="text-[10px] text-brand-gold font-extrabold tracking-[0.2em] uppercase block">
                CONSTRUCTION MANAGEMENT SYSTEM
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#001a40]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl space-y-6 relative overflow-hidden group">
            {/* Run gold border line */}
            <div className="absolute top-0 left-0 h-[4px] bg-brand-gold w-full z-20" />

            {/* Error Callout */}
            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-red-200 text-xs animate-shake">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 ml-1 block">
                  Authorized Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-brand-gold focus:bg-white/10 transition-all font-medium text-xs tracking-wide"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 ml-1 block">
                  Secret Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-brand-gold focus:bg-white/10 transition-all font-medium text-xs tracking-wide"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-brand-gold hover:bg-white text-brand-dark font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-white/5 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
