import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import Landing from './pages/Landing';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import DoctorLogin from './pages/DoctorLogin';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  const [isKannada, setIsKannada] = useState(false);

  useEffect(() => {
    const cookies = document.cookie;
    if (cookies.includes('googtrans=/en/kn') || cookies.includes('googtrans=%2Fen%2Fkn')) {
      setIsKannada(true);
    }
  }, []);

  const toggleLanguage = () => {
    if (isKannada) {
      // Clear all possible variations of the googtrans cookie to revert to English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;';
      window.location.reload();
    } else {
      // Set to Kannada
      document.cookie = 'googtrans=/en/kn; path=/;';
      document.cookie = `googtrans=/en/kn; path=/; domain=${window.location.hostname};`;
      window.location.reload();
    }
  };

  const openMobileView = () => {
    const width = 390; // Typical modern smartphone width
    const height = 844;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    window.open(window.location.href, '_blank', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
        <div className="fixed top-4 right-4 z-[9999] flex items-center gap-3">
          {/* Hide the default Google widget */}
          <div id="google_translate_element" className="hidden"></div>
          
          {/* Mobile View Toggle */}
          <button 
            onClick={openMobileView}
            title="Simulate Mobile View"
            className="flex items-center justify-center bg-card border border-border text-foreground w-10 h-10 rounded-full shadow-lg hover:bg-secondary/20 transition cursor-pointer hover:scale-105 active:scale-95"
          >
            <Smartphone className="w-5 h-5 text-primary" />
          </button>

          {/* Custom sleek language toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-full shadow-lg hover:bg-secondary/20 transition font-medium text-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className={!isKannada ? 'font-bold text-primary' : 'text-muted-foreground'}>EN</span>
            <div className={`w-10 h-5 rounded-full relative shadow-inner flex items-center transition-colors ${isKannada ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute shadow-md transform transition-transform ${isKannada ? 'translate-x-5' : 'translate-x-1'}`}></div>
            </div>
            <span className={isKannada ? 'font-bold text-primary' : 'text-muted-foreground'}>ಕನ್ನಡ</span>
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
