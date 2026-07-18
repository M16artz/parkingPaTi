import React, { useState } from 'react';
import { Check, FileCheck2, FileUp, Mail, MapPin, ShieldCheck, Trash2, Upload, UserRound } from 'lucide-react';
import { AuthField } from '../auth/AuthField';
import { ParkingLocationMap } from './ParkingLocationMap';

const fieldProps = (register, name) => ({
  name,
  value: register.formData[name],
  onChange: register.handleChange,
  error: register.errors[name],
});

const RequiredLabel = ({ children }) => <>{children} <span className="font-black text-red-600" aria-hidden="true">*</span><span className="sr-only"> obligatorio</span></>;

const PasswordRequirements = ({ password }) => {
  const rules = [
    [password.length >= 8, 'Al menos 8 caracteres'],
    [Boolean(password) && !/^\d+$/.test(password), 'No puede contener solamente números'],
  ];
  return <ul className="mt-2 grid gap-1 text-xs text-slate-500" aria-label="Requisitos de contraseña">
    {rules.map(([complete, label]) => <li key={label} className={`flex items-center gap-2 ${complete ? 'font-semibold text-emerald-700' : ''}`}><span className={`grid h-4 w-4 place-items-center rounded-full border ${complete ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>{complete && <Check aria-hidden="true" size={11} />}</span>{label}</li>)}
  </ul>;
};

export const PersonalDataStep = ({ register }) => {
  const isPassport = register.formData.tipoIdentificacion === 'PASAPORTE';
  const idPlaceholder = register.formData.tipoIdentificacion === 'RUC'
    ? 'Ej. 1101234567001'
    : isPassport ? 'Ej. A1234567' : 'Ej. 1101234567';
  return <section aria-labelledby="personal-step-title">
  <div className="flex items-start gap-3">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-primary"><UserRound aria-hidden="true" size={22} /></span>
    <div><h2 id="personal-step-title" className="text-xl font-black text-slate-900">Crea tu cuenta de propietario</h2><p className="mt-1 text-sm leading-6 text-slate-600">Ingresa tus datos personales y define las credenciales que utilizarás para acceder a ParkingPaTi.</p></div>
  </div>
  <div className="mt-7 grid gap-5 md:grid-cols-2">
    <AuthField label={<RequiredLabel>Nombres</RequiredLabel>} placeholder="Ingresa tus nombres" autoComplete="given-name" maxLength={100} required {...fieldProps(register, 'nombres')} />
    <AuthField label={<RequiredLabel>Apellidos</RequiredLabel>} placeholder="Ingresa tus apellidos" autoComplete="family-name" maxLength={100} required {...fieldProps(register, 'apellidos')} />
    <div>
      <label htmlFor="tipo-identificacion" className="mb-1.5 block text-sm font-bold text-slate-800"><RequiredLabel>Tipo de identificación</RequiredLabel></label>
      <select id="tipo-identificacion" name="tipoIdentificacion" value={register.formData.tipoIdentificacion} onChange={register.handleChange} required aria-invalid={Boolean(register.errors.tipoIdentificacion)} aria-describedby={register.errors.tipoIdentificacion ? 'tipo-identificacion-error' : undefined} className={`min-h-12 w-full rounded-xl border bg-white px-4 outline-none focus:ring-2 ${register.errors.tipoIdentificacion ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-primary focus:ring-sky-100'}`}>
        <option value="">Selecciona una opción</option><option value="CEDULA">Cédula de ciudadanía</option><option value="PASAPORTE">Pasaporte</option><option value="RUC">RUC</option>
      </select>
      {register.errors.tipoIdentificacion && <p id="tipo-identificacion-error" className="mt-1 text-xs font-semibold text-red-700">{register.errors.tipoIdentificacion}</p>}
    </div>
    <AuthField label={<RequiredLabel>Número de identificación</RequiredLabel>} placeholder={idPlaceholder} inputMode={isPassport ? 'text' : 'numeric'} pattern={isPassport ? '[A-Za-z0-9]*' : '[0-9]*'} maxLength={register.formData.tipoIdentificacion === 'RUC' ? 13 : isPassport ? 15 : 10} autoComplete="off" required {...fieldProps(register, 'identificacion')} />
    <AuthField label={<RequiredLabel>Correo electrónico</RequiredLabel>} placeholder="ejemplo@correo.com" type="email" autoComplete="email" icon={Mail} maxLength={254} required {...fieldProps(register, 'correo')} />
    <AuthField label={<RequiredLabel>Confirmar correo electrónico</RequiredLabel>} placeholder="Vuelve a escribir tu correo" type="email" autoComplete="email" maxLength={254} required {...fieldProps(register, 'confirmarCorreo')} />
    <div>
      <AuthField label={<RequiredLabel>Contraseña</RequiredLabel>} placeholder="Crea una contraseña segura" type="password" autoComplete="new-password" required {...fieldProps(register, 'password')} />
      <PasswordRequirements password={register.formData.password} />
    </div>
    <AuthField label={<RequiredLabel>Repetir contraseña</RequiredLabel>} placeholder="Vuelve a escribir tu contraseña" type="password" autoComplete="new-password" required {...fieldProps(register, 'confirmarPassword')} />
  </div>
  <div className="mt-7 flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950"><ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={20} /><p>Tus datos se utilizarán para identificar al propietario y administrar el acceso al parqueadero registrado. Verifica que ambos correos y ambas contraseñas coincidan antes de continuar.</p></div>
</section>;
};

export const ParkingDataStep = ({ register }) => <section aria-labelledby="parking-step-title">
  <div className="flex items-start gap-3">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-primary"><MapPin aria-hidden="true" size={22} /></span>
    <div><h2 id="parking-step-title" className="text-xl font-black text-slate-900">Parqueadero y ubicación</h2><p className="mt-1 text-sm text-slate-600">Registra la dirección inicial y marca la entrada principal.</p></div>
  </div>
  <div className="mt-7 grid gap-7 xl:grid-cols-[0.85fr_1.15fr]">
    <div className="grid content-start gap-5">
      <AuthField label="Nombre del parqueadero" autoComplete="organization" maxLength={150} {...fieldProps(register, 'nombreParqueadero')} />
      <AuthField label="Calle principal" autoComplete="address-line1" maxLength={200} {...fieldProps(register, 'callePrincipal')} />
      <AuthField label="Calle secundaria" autoComplete="address-line2" maxLength={200} {...fieldProps(register, 'calleSecundaria')} />
      <AuthField label="Número de lote (opcional)" autoComplete="off" maxLength={50} {...fieldProps(register, 'numeroLote')} />
    </div>
    <ParkingLocationMap formData={register.formData} error={register.errors.ubicacion} locationError={register.locationError} onSelect={register.setLocation} onReject={register.rejectLocation} />
  </div>
</section>;

const formatSize = (size) => size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
const maskIdentification = (value) => value ? `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}` : 'No disponible';

export const DocumentStep = ({ register }) => {
  const [dragging, setDragging] = useState(false);
  const acceptFile = (files) => register.handleFile(files?.[0] || null);
  return <section aria-labelledby="document-step-title">
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-primary"><FileCheck2 aria-hidden="true" size={22} /></span>
      <div><h2 id="document-step-title" className="text-xl font-black text-slate-900">Documento de verificación</h2><p className="mt-1 text-sm text-slate-600">Adjunta una copia legible del permiso de funcionamiento del parqueadero.</p></div>
    </div>

    <div className="mt-7 rounded-2xl border border-slate-200 p-5 sm:p-6">
      <h3 className="font-black text-slate-900">Documento habilitante del parqueadero</h3>
      <p className="mt-1 text-sm text-slate-600">PDF, PNG, JPG o JPEG. Tamaño máximo: 5 MB.</p>
      <label onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files); }} className={`mt-5 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition focus-within:ring-2 focus-within:ring-primary ${dragging ? 'border-primary bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-sky-50'}`}>
        <FileUp aria-hidden="true" className="text-primary" size={34} />
        <span className="mt-3 font-bold text-slate-800">Haz clic o arrastra el archivo aquí</span>
        <span className="mt-1 text-xs text-slate-500">El archivo se enviará de forma privada al backend.</span>
        <input name="archivo" className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" onChange={(event) => acceptFile(event.target.files)} aria-invalid={Boolean(register.errors.archivo)} aria-describedby={register.errors.archivo ? 'archivo-error' : undefined} />
      </label>
      {register.errors.archivo && <p id="archivo-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{register.errors.archivo}</p>}
      {register.file && <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700"><FileCheck2 aria-hidden="true" size={20} /></span>
        <div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900">{register.file.name}</p><p className="text-xs text-slate-600">{register.file.type || 'Tipo no informado'} · {formatSize(register.file.size)}</p></div>
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold text-primary hover:bg-white focus-within:ring-2 focus-within:ring-primary"><Upload aria-hidden="true" size={16} /> Reemplazar<input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" onChange={(event) => acceptFile(event.target.files)} /></label>
        <button type="button" onClick={() => register.handleFile(null)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"><Trash2 aria-hidden="true" size={16} /> Eliminar</button>
      </div>}
    </div>

    <div className="mt-6 rounded-2xl bg-slate-50 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h3 className="font-black text-slate-900">Resumen para revisión</h3><button type="button" onClick={() => register.goToStep(1)} className="text-sm font-bold text-primary underline-offset-4 hover:underline">Editar datos personales</button></div>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Propietario</dt><dd className="font-bold text-slate-800">{register.formData.nombres} {register.formData.apellidos}</dd></div>
        <div><dt className="text-slate-500">Correo</dt><dd className="break-all font-bold text-slate-800">{register.formData.correo}</dd></div>
        <div><dt className="text-slate-500">Identificación</dt><dd className="font-bold text-slate-800">{register.formData.tipoIdentificacion} · {maskIdentification(register.formData.identificacion)}</dd></div>
        <div><dt className="text-slate-500">Parqueadero</dt><dd className="font-bold text-slate-800">{register.formData.nombreParqueadero}</dd></div>
        <div><dt className="text-slate-500">Dirección</dt><dd className="font-bold text-slate-800">{[register.formData.callePrincipal, register.formData.calleSecundaria, register.formData.numeroLote].filter(Boolean).join(', ')}</dd></div>
        <div><dt className="text-slate-500">Ubicación</dt><dd className="font-bold text-slate-800">{register.formData.latitud}, {register.formData.longitud}</dd></div>
        <div className="sm:col-span-2"><dt className="text-slate-500">Documento</dt><dd className="font-bold text-slate-800">{register.file ? `${register.file.name} · ${register.file.type || 'Tipo no informado'} · ${formatSize(register.file.size)}` : 'Pendiente'}</dd></div>
      </dl>
      <button type="button" onClick={() => register.goToStep(2)} className="mt-4 text-sm font-bold text-primary underline-offset-4 hover:underline">Editar parqueadero</button>
    </div>
    <div className="mt-6 flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950"><Mail aria-hidden="true" className="mt-0.5 shrink-0" size={19} /><p>La verificación del registro se enviará a: <strong className="break-all">{register.formData.correo}</strong>. Al verificar el correo, la solicitud pasará automáticamente a revisión administrativa.</p></div>
  </section>;
};
