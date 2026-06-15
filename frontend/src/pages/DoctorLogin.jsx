import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 border border-border rounded-2xl bg-card text-card-foreground shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-secondary">Doctor Login</h2>
        {error && <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-2.5 mt-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
