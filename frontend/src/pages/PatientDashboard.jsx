import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Pill, Calendar, FileText, Upload, Download, Trash2 } from 'lucide-react';

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/patient/login');
      return;
    }
    fetchPatientData(user.patientCode);
  }, []);

  const fetchPatientData = async (code) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/${code}`);
      setPatient(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/vitals`, {
        patientId: patient.id,
        systolicBP,
        diastolicBP,
        bloodSugar
      });
      setSystolicBP('');
      setDiastolicBP('');
      setBloodSugar('');
      fetchPatientData(patient.patientCode);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile || !docTitle) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('patientId', patient.id);
    formData.append('title', docTitle);
    formData.append('file', docFile);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocTitle('');
      setDocFile(null);
      fetchPatientData(patient.patientCode);
    } catch (err) {
      console.error(err);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/document/${docId}`);
      fetchPatientData(patient.patientCode);
    } catch (err) {
      console.error(err);
      alert('Failed to delete document.');
    }
  };

  if (!patient) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-card p-8 rounded-3xl shadow-lg border border-white/50 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Welcome, {patient.name}</h1>
            <p className="text-slate-500 mt-2 text-lg">Patient Code: <span className="font-mono font-bold bg-white px-3 py-1.5 rounded-lg text-slate-800 shadow-sm border border-slate-200">{patient.patientCode}</span></p>
          </div>
          <div className="mt-4 md:mt-0 bg-white shadow-sm border border-slate-100 text-slate-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Next Visit</p>
              <p className="font-bold text-slate-800">
                {patient.nextVisitDate ? new Date(patient.nextVisitDate).toLocaleDateString() : 'Not scheduled'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Add Vitals */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-primary w-5 h-5" />
                Log Vitals
              </h2>
              <form onSubmit={handleAddVitals} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Systolic BP</label>
                    <input type="number" required value={systolicBP} onChange={e => setSystolicBP(e.target.value)} className="w-full p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm" placeholder="120" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Diastolic BP</label>
                    <input type="number" required value={diastolicBP} onChange={e => setDiastolicBP(e.target.value)} className="w-full p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm" placeholder="80" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Blood Sugar (mg/dL)</label>
                  <input type="number" required value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} className="w-full p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm" placeholder="100" />
                </div>
                <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition">
                  Save Vitals
                </button>
              </form>
            </div>

            {/* Upload Document */}
            <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200/60 mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="text-primary w-5 h-5" />
                Upload Report
              </h2>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Report Title</label>
                  <input type="text" required value={docTitle} onChange={e => setDocTitle(e.target.value)} className="w-full p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm" placeholder="e.g., Blood Test Results" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">File</label>
                  <input type="file" required onChange={e => setDocFile(e.target.files[0])} className="w-full p-2 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm" />
                </div>
                <button type="submit" disabled={isUploading} className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Upload Report'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: History & Meds */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-primary w-5 h-5" />
                Vitals History
              </h2>
              {patient.vitals?.length === 0 ? (
                <p className="text-muted-foreground">No vitals logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200/60 text-muted-foreground text-sm">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Blood Pressure</th>
                        <th className="pb-3 font-medium">Blood Sugar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.vitals?.map(v => (
                        <tr key={v.id} className="border-b border-slate-200/60/50 last:border-0">
                          <td className="py-3">{new Date(v.recordedAt).toLocaleString()}</td>
                          <td className="py-3 font-medium text-foreground">{v.systolicBP} / {v.diastolicBP}</td>
                          <td className="py-3 font-medium text-foreground">{v.bloodSugar} mg/dL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Visit History */}
            <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-primary w-5 h-5" />
                Visit History
              </h2>
              {patient.visits?.length === 0 ? (
                <p className="text-muted-foreground">No visits logged yet.</p>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto pr-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200/60 text-muted-foreground text-sm">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Doctor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.visits?.map(v => (
                        <tr key={v.id} className="border-b border-slate-200/60/50 last:border-0">
                          <td className="py-3 text-foreground">{new Date(v.visitDate).toLocaleString()}</td>
                          <td className="py-3 font-medium text-foreground">Dr. {v.doctor?.username}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Pill className="text-primary w-5 h-5" />
                Current Prescriptions
              </h2>
              {patient.prescriptions?.length === 0 ? (
                <p className="text-muted-foreground">No active prescriptions.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.prescriptions?.map(p => (
                    <div key={p.id} className="p-4 border border-slate-200/60 rounded-xl bg-white/50 backdrop-blur-md">
                      <h3 className="font-semibold text-lg">{p.tabletName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Dosage: {p.dosage}</p>
                      <p className="text-sm text-muted-foreground">Timing: {p.timing}</p>
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-slate-200/60">
                        Prescribed by Dr. {p.doctor?.username} on {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reports & Documents */}
            <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="text-primary w-5 h-5" />
                Reports & Documents
              </h2>
              {(!patient.documents || patient.documents.length === 0) ? (
                <p className="text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {patient.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white/50 backdrop-blur-md">
                      <div>
                        <h3 className="font-semibold text-foreground">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-secondary/10 text-secondary hover:bg-secondary/20 px-3 py-2 rounded-lg transition text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          View
                        </a>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
