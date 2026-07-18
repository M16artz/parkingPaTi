import React, { useState } from 'react';
import { Button } from './views/components/Button';
import { AvailabilityBadge } from './views/components/AvailabilityBadge';

function App() {
  const [testMessage, setTestMessage] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6FB] p-6 gap-6">
      {/* Header section using Comfortaa font */}
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline text-primary tracking-tight">
          ParkingPaTi
        </h1>
        <p className="text-secondary font-body mt-2">
          Frontend Web Development Environment (Loja 2026)
        </p>
      </div>

      {/* Showcase Card built with Tailwind and modern styling */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full flex flex-col gap-6">
        <h2 className="text-lg font-bold font-body text-tertiary">
          Component Test Bench
        </h2>
        
        {/* Testing our smart availability badges */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold font-label text-secondary uppercase tracking-wider">
            Live Badges:
          </label>
          <div className="flex gap-2 flex-wrap">
            <AvailabilityBadge status="available" />
            <AvailabilityBadge status="almost_full" />
            <AvailabilityBadge status="full" />
          </div>
        </div>

        {/* Testing our custom primary buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <label className="text-xs font-bold font-label text-secondary uppercase tracking-wider">
            Action Buttons:
          </label>
          <Button variant="primary" onClick={() => setTestMessage('El entorno frontend responde correctamente.')}>
            Test Click Event
          </Button>
          <Button variant="success" isLoading={true}>
            Simulating API Request...
          </Button>
          {testMessage && <p role="status" className="text-sm font-semibold text-emerald-700">{testMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
