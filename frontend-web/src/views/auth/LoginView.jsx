import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock } from 'lucide-react';
import { useLoginController } from '../../controllers/useLoginController';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { destinoSesion } from '../../utils/adminAccess';

export const LoginView = () => {
  const login = useLoginController();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form
        className="w-full max-w-md bg-white border border-slate-200 p-8 shadow-sm"
        onSubmit={(event) => login.handleSubmit(event, (session) => {
          navigate(destinoSesion(session));
        })}
      >
        <Car className="text-primary" size={36} />
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Iniciar sesión</h1>
        <div className="mt-7">
          <Input name="correo" label="Correo" type="email" icon={Mail} value={login.formData.correo} onChange={login.handleChange} error={login.errors.correo} />
          <Input name="password" label="Contraseña" type="password" icon={Lock} value={login.formData.password} onChange={login.handleChange} error={login.errors.password} />
        </div>
        {login.errors.formulario && <p className="mb-4 text-sm text-red-600">{login.errors.formulario}</p>}
        <Button type="submit" className="w-full" isLoading={login.isSubmitting}>Ingresar</Button>
        <p className="mt-5 text-center text-sm text-slate-500">
          ¿No tienes cuenta? <Link className="font-bold text-primary" to="/register">Regístrate</Link>
        </p>
      </form>
    </main>
  );
};
