import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ArrowRight, Stethoscope } from 'lucide-react';

export default function DoctorLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/doctor/login', {
        username,
        password
      });
      
      localStorage.setItem('doctorToken', res.data.token);
      localStorage.setItem('doctor', JSON.stringify(res.data.doctor));
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
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
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mt-6 mb-4 shadow-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900">Doctor Portal</h2>
          <p className="text-slate-600 mt-2">Secure access for medical staff</p>
        </div>

        <div className="glass-panel p-8 text-card-foreground">
          {error && <div className="p-4 mb-6 text-sm font-medium text-destructive-foreground bg-destructive/90 rounded-xl animate-in fade-in">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-slate-900"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dr_smith"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full group flex items-center justify-center gap-2 py-3.5 mt-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              Secure Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
