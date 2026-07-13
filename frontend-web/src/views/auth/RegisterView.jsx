import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useRegisterController } from '../../controllers/useRegisterController';
import { authService } from '../../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const RegisterView = () => {
  const register = useRegisterController();
  const [createdEmail, setCreatedEmail] = useState('');
  const resend = useMutation({ mutationFn: authService.resendVerification });

  if (createdEmail) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <section className="w-full max-w-lg bg-white border border-slate-200 p-8 shadow-sm text-center">
          <MailCheck className="mx-auto text-primary" size={42} />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Verifica tu correo</h1>
          <p className="mt-3 text-slate-600">Enviamos el enlace de verificación a {createdEmail}.</p>
          <Button
            className="mt-6"
            variant="outline"
            isLoading={resend.isPending}
            onClick={() => resend.mutate(createdEmail)}
          >
            Reenviar correo
          </Button>
          <p className="mt-5 text-sm text-slate-500">
            Después de verificarlo, <Link className="text-primary font-bold" to="/login">inicia sesión</Link>.
          </p>
        </section>
      </main>
    );
  }

  const fields = [
    ['nombres', 'Nombres', 'text'],
    ['apellidos', 'Apellidos', 'text'],
    ['identificacion', 'Identificación', 'text'],
    ['correo', 'Correo', 'email'],
    ['confirmarCorreo', 'Repetir correo', 'email'],
    ['password', 'Contraseña', 'password'],
    ['confirmarPassword', 'Repetir contraseña', 'password'],
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-5">
      <form
        className="mx-auto max-w-2xl bg-white border border-slate-200 p-8 shadow-sm"
        onSubmit={(event) => register.handleSubmit(event, () => setCreatedEmail(register.formData.correo))}
      >
        <h1 className="text-3xl font-bold text-slate-900">Crear cuenta de propietario</h1>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">
            Tipo de identificación
            <select
              name="tipoIdentificacion"
              value={register.formData.tipoIdentificacion}
              onChange={register.handleChange}
              className="mt-2 w-full border border-slate-300 px-4 py-3"
            >
              <option value="">Selecciona</option>
              <option value="CEDULA">Cédula</option>
              <option value="RUC">RUC</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
            {register.errors.tipoIdentificacion && <span className="text-xs text-red-600">{register.errors.tipoIdentificacion}</span>}
          </label>
          {fields.map(([name, label, type]) => (
            <Input
              key={name}
              name={name}
              label={label}
              type={type}
              value={register.formData[name]}
              onChange={register.handleChange}
              error={register.errors[name]}
            />
          ))}
        </div>
        {register.errors.formulario && <p className="text-sm text-red-600">{register.errors.formulario}</p>}
        <Button type="submit" className="mt-4 w-full" isLoading={register.isSaving}>Crear cuenta</Button>
        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta? <Link to="/login" className="font-bold text-primary">Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
};
