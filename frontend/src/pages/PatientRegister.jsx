import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PatientRegister() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post('https://hospital-backend-8ot5.onrender.com/api/auth/patient/register', {
        name,
        phoneNumber
      });
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/patient/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/50 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-primary font-bold text-xl tracking-tight hover:opacity-80 transition">HealthTrack</Link>
          <h2 className="text-4xl font-extrabold mt-6 text-slate-900">Create Account</h2>
          <p className="text-slate-600 mt-2">Join our secure patient portal</p>
        </div>

        <div className="glass-panel p-8 text-card-foreground">
          {error && <div className="p-4 mb-6 text-sm font-medium text-destructive-foreground bg-destructive/90 rounded-xl animate-in fade-in">{error}</div>}
          {success && <div className="p-4 mb-6 text-sm font-medium text-white bg-emerald-500 rounded-xl animate-in fade-in flex items-center gap-2"><ShieldCheck className="w-5 h-5"/>{success}</div>}
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input 
                  type="tel" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-slate-900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full group flex items-center justify-center gap-2 py-3.5 mt-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            >
              Register Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <Link to="/patient/login" className="text-primary font-semibold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
