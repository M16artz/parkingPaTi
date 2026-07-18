import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, FileUp, MailCheck, MapPin, UserRound } from 'lucide-react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useMutation } from '@tanstack/react-query';
import { useRegisterController } from '../../controllers/useRegisterController';
import { LOJA_BOUNDS, LOJA_CENTER, estaEnLoja } from '../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../config/env';
import { authService } from '../../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const STEPS = [
  { id: 1, label: 'Datos personales', icon: UserRound },
  { id: 2, label: 'Parqueadero', icon: MapPin },
  { id: 3, label: 'Documento', icon: FileUp },
];

function RegistrationStepper({ current }) {
  return (
    <ol className="grid grid-cols-3" aria-label="Progreso del registro">
      {STEPS.map(({ id, label, icon: Icon }, index) => {
        const complete = id < current;
        const active = id === current;
        return (
          <li key={id} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span className={`absolute right-1/2 top-5 h-0.5 w-full ${id <= current ? 'bg-sky-600' : 'bg-slate-200'}`} aria-hidden="true" />
            )}
            <span
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${active || complete ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white text-slate-400'}`}
              aria-current={active ? 'step' : undefined}
            >
              {complete ? <Check size={19} /> : <Icon size={18} />}
            </span>
            <span className={`mt-2 text-xs font-bold sm:text-sm ${active ? 'text-sky-700' : 'text-slate-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(event) {
      if (estaEnLoja(event.latlng.lat, event.latlng.lng)) {
        onChange(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6));
      }
    },
  });
  return position.latitud && position.longitud
    ? <Marker position={[Number(position.latitud), Number(position.longitud)]} />
    : null;
}

export const RegisterView = () => {
  const register = useRegisterController();
  const [createdEmail, setCreatedEmail] = useState('');
  const resend = useMutation({ mutationFn: authService.resendVerification });

  if (createdEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MailCheck className="mx-auto text-primary" size={42} />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Registro completado</h1>
          <p className="mt-3 text-slate-600">Guardamos tus datos, parqueadero y documento. Enviamos el enlace de verificación a {createdEmail}.</p>
          <Button className="mt-6" variant="outline" isLoading={resend.isPending} onClick={() => resend.mutate(createdEmail)}>
            Reenviar correo
          </Button>
          <p className="mt-5 text-sm text-slate-500">
            Después de verificarlo, <Link className="font-bold text-primary" to="/login">inicia sesión</Link>.
          </p>
        </section>
      </main>
    );
  }

  const personalFields = [
    ['nombres', 'Nombres', 'text'],
    ['apellidos', 'Apellidos', 'text'],
    ['identificacion', 'Identificación', 'text'],
    ['correo', 'Correo', 'email'],
    ['confirmarCorreo', 'Repetir correo', 'email'],
    ['password', 'Contraseña', 'password'],
    ['confirmarPassword', 'Repetir contraseña', 'password'],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-7 sm:px-10">
          <p className="text-sm font-bold uppercase tracking-wider text-sky-700">Registro de propietario</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Completa tu solicitud</h1>
          <div className="mx-auto mt-7 max-w-2xl"><RegistrationStepper current={register.step} /></div>
        </header>

        <form
          className="px-6 py-7 sm:px-10"
          onSubmit={register.step === 1 ? register.continuePersonal : register.step === 2 ? register.continueParking : (event) => register.handleSubmit(event, () => setCreatedEmail(register.formData.correo))}
        >
          {register.step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">Datos personales y acceso</h2>
              <p className="mt-1 text-sm text-slate-600">Estos datos identificarán al propietario del parqueadero.</p>
              <div className="mt-6 grid gap-x-5 md:grid-cols-2">
                <label className="mb-4 block text-sm font-bold text-slate-700">
                  Tipo de identificación
                  <select name="tipoIdentificacion" value={register.formData.tipoIdentificacion} onChange={register.handleChange} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4">
                    <option value="">Selecciona</option>
                    <option value="CEDULA">Cédula</option>
                    <option value="RUC">RUC</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                  {register.errors.tipoIdentificacion && <span className="mt-1 block text-xs text-red-600">{register.errors.tipoIdentificacion}</span>}
                </label>
                {personalFields.map(([name, label, type]) => (
                  <Input key={name} name={name} label={label} type={type} value={register.formData[name]} onChange={register.handleChange} error={register.errors[name]} />
                ))}
              </div>
            </div>
          )}

          {register.step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">Datos del parqueadero</h2>
              <p className="mt-1 text-sm text-slate-600">Completa la dirección y haz clic en el mapa para marcar la ubicación exacta.</p>
              <div className="mt-6 grid gap-x-5 md:grid-cols-2">
                <Input name="nombreParqueadero" label="Nombre del parqueadero" value={register.formData.nombreParqueadero} onChange={register.handleChange} error={register.errors.nombreParqueadero} />
                <Input name="callePrincipal" label="Calle principal" value={register.formData.callePrincipal} onChange={register.handleChange} error={register.errors.callePrincipal} />
                <Input name="calleSecundaria" label="Calle secundaria" value={register.formData.calleSecundaria} onChange={register.handleChange} />
                <Input name="numeroLote" label="Número de lote" value={register.formData.numeroLote} onChange={register.handleChange} />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <div className="h-80">
                  <MapContainer center={LOJA_CENTER} zoom={13} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1} className="h-full w-full">
                    <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
                    <LocationPicker position={register.formData} onChange={register.setLocation} />
                  </MapContainer>
                </div>
              </div>
              {register.errors.ubicacion && <p className="mt-2 text-sm text-red-600">{register.errors.ubicacion}</p>}
              <p className="mt-2 text-sm text-slate-600">
                {register.formData.latitud ? `Ubicación seleccionada: ${register.formData.latitud}, ${register.formData.longitud}` : 'Aún no has seleccionado una ubicación.'}
              </p>
            </div>
          )}

          {register.step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">Documento habilitante</h2>
              <p className="mt-1 text-sm text-slate-600">El archivo se almacenará de forma privada. Formatos permitidos: PDF, JPG o PNG; máximo 5 MB.</p>
              <label className="mt-7 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-sky-500 hover:bg-sky-50">
                <FileUp className="text-sky-700" size={36} />
                <span className="mt-3 font-bold text-slate-800">Seleccionar documento</span>
                <span className="mt-1 text-sm text-slate-500">{register.file?.name || 'Ningún archivo seleccionado'}</span>
                <input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => register.handleFile(event.target.files?.[0] || null)} />
              </label>
              {register.errors.archivo && <p className="mt-2 text-sm text-red-600">{register.errors.archivo}</p>}
              <div className="mt-6 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <p><strong className="text-slate-800">Propietario:</strong> {register.formData.nombres} {register.formData.apellidos}</p>
                <p className="mt-1"><strong className="text-slate-800">Parqueadero:</strong> {register.formData.nombreParqueadero}</p>
              </div>
            </div>
          )}

          {register.errors.formulario && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{register.errors.formulario}</p>}

          <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            {register.step > 1 ? <Button variant="outline" onClick={register.previousStep}>Volver</Button> : <Link className="self-center text-sm font-bold text-sky-700" to="/login">Ya tengo una cuenta</Link>}
            <Button type="submit" isLoading={register.isSaving}>
              {register.step === 3 ? 'Finalizar registro' : 'Continuar'}
            </Button>
          </footer>
        </form>
      </section>
    </main>
  );
};
