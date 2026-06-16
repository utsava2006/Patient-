import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, UserCircle2, Stethoscope } from 'lucide-react';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center p-4">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/50 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-5xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 mt-12">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
            HealthTrack
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
            Your personal health record system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Card */}
          <div className="glass-card p-8 group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/50 cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <UserCircle2 className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <UserCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">For Patients</h2>
              <Link 
                to="/patient/login" 
                className="inline-flex items-center justify-center w-full py-4 px-6 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
              >
                Access Patient Portal
              </Link>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="glass-card p-8 group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-secondary/50 cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Stethoscope className="w-32 h-32 text-secondary" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">For Doctors</h2>
              <Link 
                to="/doctor/login" 
                className="inline-flex items-center justify-center w-full py-4 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                Access Doctor Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
