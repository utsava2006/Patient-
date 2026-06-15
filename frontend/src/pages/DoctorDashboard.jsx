import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Activity, Pill, Calendar, Trash2, Users, Settings, X } from 'lucide-react';

export default function DoctorDashboard() {
  const [searchCode, setSearchCode] = useState('');
  const [patient, setPatient] = useState(null);
  const [searchError, setSearchError] = useState('');
  
  // Prescription Form
  const [tabletName, setTabletName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('');
  
  // Visit Form
  const [nextVisitDate, setNextVisitDate] = useState('');

  // Vitals Form
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  
  // Settings Form
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewUsername, setSettingsNewUsername] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const handleOpenSettings = () => {
    setSettingsNewUsername(doctor?.username || '');
    setSettingsCurrentPassword('');
    setSettingsNewPassword('');
    setSettingsError('');
    setSettingsSuccess('');
    setShowSettingsModal(true);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    if (!settingsCurrentPassword) {
      setSettingsError('Current password is required to save changes');
      return;
    }
    try {
      const res = await axios.put(`http://localhost:5000/api/doctor/${doctor.id}/credentials`, {
        currentPassword: settingsCurrentPassword,
        newUsername: settingsNewUsername,
        newPassword: settingsNewPassword
      });
      
      setSettingsSuccess('Credentials updated successfully!');
      
      const updatedDoctor = { ...doctor, username: res.data.username };
      localStorage.setItem('doctor', JSON.stringify(updatedDoctor));
      setDoctor(updatedDoctor);
      
      setTimeout(() => setShowSettingsModal(false), 2000);
    } catch (err) {
      setSettingsError(err.response?.data?.error || 'Failed to update credentials');
    }
  };
  const [stats, setStats] = useState(null);
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    const doc = JSON.parse(localStorage.getItem('doctor'));
    if (!doc) {
      navigate('/doctor/login');
      return;
    }
    setDoctor(doc);

    const fetchStatsAndPatients = async () => {
      try {
        const statsRes = await axios.get('http://localhost:5000/api/doctor/stats');
        setStats(statsRes.data);
        const patientsRes = await axios.get('http://localhost:5000/api/doctor/patients');
        setAllPatients(patientsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchStatsAndPatients();
  }, []);

  const handleSearch = async (e, codeOverride) => {
    if (e) e.preventDefault();
    const codeToSearch = codeOverride || searchCode;
    setSearchError('');
    setPatient(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/patient/${codeToSearch}`);
      setPatient(res.data);
      setSearchCode(res.data.patientCode);
      if (res.data.nextVisitDate) {
        setNextVisitDate(new Date(res.data.nextVisitDate).toISOString().split('T')[0]);
      } else {
        setNextVisitDate('');
      }
    } catch (err) {
      setSearchError('Patient not found');
    }
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/doctor/prescribe', {
        patientId: patient.id,
        doctorId: doctor.id,
        tabletName,
        dosage,
        timing
      });
      setTabletName('');
      setDosage('');
      setTiming('');
      // Refresh patient data
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/doctor/patient/${patient.patientCode}/visit`, {
        nextVisitDate
      });
      alert('Visit scheduled successfully!');
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patient/vitals', {
        patientId: patient.id,
        systolicBP,
        diastolicBP,
        bloodSugar
      });
      setSystolicBP('');
      setDiastolicBP('');
      setBloodSugar('');
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (!window.confirm('Are you sure you want to delete this visit record?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctor/visit/${visitId}`);
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
      alert('Failed to delete visit');
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctor/prescription/${prescriptionId}`);
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
      alert('Failed to delete prescription');
    }
  };

  const handleLogVisit = async () => {
    try {
      await axios.post('http://localhost:5000/api/doctor/log-visit', {
        patientId: patient.id,
        doctorId: doctor.id
      });
      alert('Visit logged successfully!');
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      console.error(err);
      alert('Failed to log visit');
    }
  };

  const handleDeletePatient = async (e, patientId, patientName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete patient ${patientName} and all their records?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctor/patient/${patientId}`);
      
      const patientsRes = await axios.get('http://localhost:5000/api/doctor/patients');
      setAllPatients(patientsRes.data);
      const statsRes = await axios.get('http://localhost:5000/api/doctor/stats');
      setStats(statsRes.data);
      
      if (patient?.id === patientId) {
        setPatient(null);
        setSearchCode('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h1 className="text-3xl font-bold text-secondary">Doctor Dashboard</h1>
          <div className="flex items-center gap-6">
            {stats && (
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg text-sm">
                <Users className="w-5 h-5 text-secondary" />
                <span className="font-semibold">{stats.totalPatients} Patients Registered</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground font-medium">Dr. {doctor?.username}</p>
              <button onClick={handleOpenSettings} className="p-2 hover:bg-muted rounded-full transition" title="Settings">
                <Settings className="w-5 h-5 text-secondary" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Search Patient Code</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  required
                  value={searchCode}
                  onChange={e => setSearchCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 p-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary uppercase" 
                  placeholder="PT-1234" 
                />
              </div>
            </div>
            <button type="submit" className="py-2.5 px-6 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition">
              Search
            </button>
          </form>
          {searchError && <p className="text-destructive mt-3 text-sm font-medium text-center">{searchError}</p>}
        </div>

        {!patient && allPatients.length > 0 && (
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="text-secondary w-5 h-5" /> All Registered Patients
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm">
                    <th className="pb-4 font-medium">Patient Code</th>
                    <th className="pb-4 font-medium">Name</th>
                    <th className="pb-4 font-medium">Phone Number</th>
                    <th className="pb-4 font-medium">Total Visits</th>
                    <th className="pb-4 font-medium">Next Visit</th>
                    <th className="pb-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPatients.map(p => (
                    <tr 
                      key={p.id} 
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition cursor-pointer" 
                      onClick={() => handleSearch(null, p.patientCode)}
                    >
                      <td className="py-4 font-mono font-bold text-secondary">{p.patientCode}</td>
                      <td className="py-4 font-medium">{p.name}</td>
                      <td className="py-4 text-muted-foreground">{p.phoneNumber}</td>
                      <td className="py-4">{p.visitCount}</td>
                      <td className="py-4">{p.nextVisitDate ? new Date(p.nextVisitDate).toLocaleDateString() : 'Not Scheduled'}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={(e) => handleDeletePatient(e, p.id, p.name)}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {patient && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Patient Info & Vitals */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{patient.name}</h2>
                    <p className="text-muted-foreground mt-1">Phone: {patient.phoneNumber}</p>
                    <p className="text-muted-foreground mt-1 font-medium">Total Visits: {patient.visitCount || 0}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-muted px-3 py-1 rounded text-foreground font-mono font-bold">{patient.patientCode}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="text-secondary w-5 h-5" /> Vitals History
                </h3>
                {patient.vitals?.length === 0 ? (
                  <p className="text-muted-foreground">No vitals logged yet.</p>
                ) : (
                  <div className="overflow-x-auto max-h-80 overflow-y-auto pr-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-sm">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Blood Pressure</th>
                          <th className="pb-3 font-medium">Blood Sugar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.vitals?.map(v => (
                          <tr key={v.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3">{new Date(v.recordedAt).toLocaleString()}</td>
                            <td className="py-3 font-medium">{v.systolicBP} / {v.diastolicBP}</td>
                            <td className="py-3 font-medium">{v.bloodSugar} mg/dL</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Visit History */}
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="text-secondary w-5 h-5" /> Visit History
                  </h3>
                  <button 
                    onClick={handleLogVisit}
                    className="bg-primary text-primary-foreground text-sm font-medium py-1.5 px-3 rounded-lg hover:opacity-90 transition"
                  >
                    Log Visit Now
                  </button>
                </div>
                {patient.visits?.length === 0 ? (
                  <p className="text-muted-foreground">No visits logged yet.</p>
                ) : (
                  <div className="overflow-x-auto max-h-80 overflow-y-auto pr-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-sm">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Doctor</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.visits?.map(v => (
                          <tr key={v.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3">{new Date(v.visitDate).toLocaleString()}</td>
                            <td className="py-3 font-medium">Dr. {v.doctor?.username}</td>
                            <td className="py-3 text-right">
                              <button 
                                onClick={() => handleDeleteVisit(v.id)}
                                className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition"
                                title="Delete Visit"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Current Prescriptions */}
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border mt-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Pill className="text-secondary w-5 h-5" /> Current Prescriptions
                </h3>
                {patient.prescriptions?.length === 0 ? (
                  <p className="text-muted-foreground">No active prescriptions.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.prescriptions?.map(p => (
                      <div key={p.id} className="p-4 border border-border rounded-xl bg-muted/30">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{p.tabletName}</h3>
                          <button 
                            onClick={() => handleDeletePrescription(p.id)}
                            className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition"
                            title="Delete Prescription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Dosage: {p.dosage}</p>
                        <p className="text-sm text-muted-foreground">Timing: {p.timing}</p>
                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                          Prescribed by Dr. {p.doctor?.username} on {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Vitals, Prescribe & Schedule */}
            <div className="lg:col-span-1 space-y-8">
              {/* Log Vitals */}
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="text-primary w-5 h-5" /> Log Vitals
                </h3>
                <form onSubmit={handleAddVitals} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Systolic BP</label>
                      <input type="number" required value={systolicBP} onChange={e => setSystolicBP(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg" placeholder="120" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Diastolic BP</label>
                      <input type="number" required value={diastolicBP} onChange={e => setDiastolicBP(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg" placeholder="80" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Sugar (mg/dL)</label>
                    <input type="number" required value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg" placeholder="100" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                    Add Vitals
                  </button>
                </form>
              </div>
              {/* Prescribe */}
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Pill className="text-secondary w-5 h-5" /> Prescribe Medication
                </h3>
                <form onSubmit={handlePrescribe} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tablet Name</label>
                    <input type="text" required value={tabletName} onChange={e => setTabletName(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg" placeholder="e.g. Metformin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dosage</label>
                    <input type="text" required value={dosage} onChange={e => setDosage(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg" placeholder="e.g. 500mg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timing</label>
                    <input type="text" required value={timing} onChange={e => setTiming(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg" placeholder="e.g. Twice a day after meals" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                    Add Prescription
                  </button>
                </form>
              </div>

              {/* Schedule */}
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="text-secondary w-5 h-5" /> Schedule Visit
                </h3>
                <form onSubmit={handleScheduleVisit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Next Visit Date</label>
                    <input type="date" required value={nextVisitDate} onChange={e => setNextVisitDate(e.target.value)} className="w-full p-2 bg-input border border-border rounded-lg text-foreground" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                    Set Date
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-lg border border-border overflow-hidden animate-in zoom-in-95">
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-secondary" />
                  Update Credentials
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-muted rounded-full transition text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateSettings} className="p-6 space-y-4">
                {settingsError && <p className="text-destructive text-sm font-medium">{settingsError}</p>}
                {settingsSuccess && <p className="text-green-500 text-sm font-medium">{settingsSuccess}</p>}
                
                <div>
                  <label className="block text-sm font-medium mb-1">New Username (optional)</label>
                  <input 
                    type="text" 
                    value={settingsNewUsername} 
                    onChange={(e) => setSettingsNewUsername(e.target.value)} 
                    className="w-full p-2 bg-input border border-border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password (optional)</label>
                  <input 
                    type="password" 
                    value={settingsNewPassword} 
                    onChange={(e) => setSettingsNewPassword(e.target.value)} 
                    className="w-full p-2 bg-input border border-border rounded-lg" 
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium mb-1">Current Password (required to save)</label>
                  <input 
                    type="password" 
                    required 
                    value={settingsCurrentPassword} 
                    onChange={(e) => setSettingsCurrentPassword(e.target.value)} 
                    className="w-full p-2 bg-input border border-border rounded-lg" 
                  />
                </div>
                
                <button type="submit" className="w-full mt-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
