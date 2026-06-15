import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-primary">
          HealthTrack Pro
        </h1>
        <p className="text-xl text-muted-foreground">
          Your personal health record system. Seamlessly connect patients, doctors, and families with real-time vitals and prescriptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
          {/* Patient Card */}
          <div className="p-6 border border-border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-semibold mb-2">Patients</h2>
            <p className="text-muted-foreground mb-6">Log your vitals, view prescriptions, and see your next visit.</p>
            <Link to="/patient/login" className="inline-block w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition">
              Patient Login
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="p-6 border border-border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition">
            <h2 className="text-2xl font-semibold mb-2">Doctors</h2>
            <p className="text-muted-foreground mb-6">Access patient history, prescribe medications, and schedule visits.</p>
            <Link to="/doctor/login" className="inline-block w-full py-2 px-4 bg-secondary text-secondary-foreground font-medium rounded-lg hover:opacity-90 transition">
              Doctor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
