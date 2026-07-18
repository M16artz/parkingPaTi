import React from 'react';
import { FinalConfigurationForm } from './FinalConfigurationForm';

export const OwnerConfigGeneral = ({ data, pending, onSave }) => <div className="owner-view-enter">
  <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
    El estado operativo se calcula automáticamente desde la disponibilidad de los espacios. Aquí se administran únicamente horarios y tarifas.
  </div>
  <FinalConfigurationForm data={data} pending={pending} onSave={onSave} operationalOnly />
</div>;
