import React from 'react';
import { Lock, Mail } from 'lucide-react';
import { Button } from '../Button';
import { AuthField } from './AuthField';

export const LoginForm = ({ controller, onSubmit, onRegister }) => <form className="mx-auto w-full max-w-md space-y-5" onSubmit={onSubmit} noValidate>
  <div><p className="text-sm font-black uppercase tracking-widest text-sky-700">Acceso seguro</p><h1 className="mt-2 font-headline text-3xl font-bold text-slate-950 sm:text-4xl">Iniciar sesión</h1><p className="mt-2 text-sm text-slate-600">Ingresa con la cuenta registrada en ParkingPaTi.</p></div>
  <AuthField name="correo" label="Correo electrónico" type="email" icon={Mail} autoComplete="email" value={controller.formData.correo} onChange={controller.handleChange} error={controller.errors.correo} />
  <AuthField name="password" label="Contraseña" type="password" icon={Lock} autoComplete="current-password" value={controller.formData.password} onChange={controller.handleChange} error={controller.errors.password} />
  <div className="flex justify-end"><span className="text-xs font-semibold text-slate-500" title="Función todavía no disponible">Recuperación de contraseña no disponible</span></div>
  {controller.errors.formulario && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{controller.errors.formulario}</p>}
  <Button type="submit" className="w-full rounded-xl py-3" isLoading={controller.isSubmitting} loadingLabel="Iniciando sesión…">Iniciar sesión</Button>
  <p className="text-center text-sm text-slate-600 lg:hidden">¿Aún no tienes una cuenta? <button type="button" onClick={onRegister} className="font-bold text-sky-800 underline-offset-4 hover:underline">Registrarse</button></p>
</form>;
