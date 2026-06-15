import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function PatientLogin() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/patient/login', {
        name,
        phoneNumber
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.patient));
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 border border-border rounded-2xl bg-card text-card-foreground shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary">Patient Login</h2>
        {error && <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input 
              type="tel" 
              required
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="1234567890"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2.5 mt-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New Patient? <Link to="/patient/register" className="text-primary font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
