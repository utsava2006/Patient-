import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function PatientRegister() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/patient/register', {
        name,
        phoneNumber
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.patient));
      alert(`Registration successful! Your Patient Code is ${res.data.patient.patientCode}. Please save it for future logins.`);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 border border-border rounded-2xl bg-card text-card-foreground shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary">Patient Registration</h2>
        {error && <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
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
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered? <Link to="/patient/login" className="text-primary font-medium hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
