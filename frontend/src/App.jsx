import React, { useState } from 'react';
import IntroAnimation from './components/IntroAnimation';
import PatientForm from './components/PatientForm';
import MRIUpload from './components/MRIUpload';
import { Activity } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('intro'); // 'intro', 'form', 'upload'
  const [patientData, setPatientData] = useState(null);

  const handleIntroComplete = () => {
    setCurrentView('form');
  };

  const handlePatientSubmit = (data) => {
    setPatientData(data);
    setCurrentView('upload');
  };

  const handleRestart = () => {
    setPatientData(null);
    setCurrentView('form'); // Go back to form, no need to show intro again
  };

  return (
    <div>
      {currentView === 'intro' && <IntroAnimation onComplete={handleIntroComplete} />}

      {currentView !== 'intro' && (
        <div className="app-container">
          <header className="header animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                background: 'rgba(74, 222, 128, 0.1)',
                padding: '0.5rem',
                borderRadius: '12px',
                display: 'flex'
              }}>
                <Activity size={28} color="var(--primary)" />
              </div>
              <h1 className="logo-text">NEUROSCAN</h1>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              AI MRI Analysis System v1.0
            </div>
          </header>

          <main style={{ flex: 1 }}>
            {currentView === 'form' && <PatientForm onSubmit={handlePatientSubmit} />}
            {currentView === 'upload' && <MRIUpload patientData={patientData} onRestart={handleRestart} />}
          </main>

          <footer style={{
            textAlign: 'center',
            paddingTop: '2rem',
            borderTop: '1px solid var(--glass-border)',
            marginTop: '4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            &copy; 2026 NeuroScan Medical Systems. For demonstration purposes.
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;
