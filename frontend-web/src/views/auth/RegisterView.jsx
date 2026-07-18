import React from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoSimple from '../../assets/logoSimple.png';
import { useRegisterController } from '../../controllers/useRegisterController';
import { Button } from '../components/Button';
import { RegisterDialog } from '../components/register/RegisterDialog';
import { DocumentStep, ParkingDataStep, PersonalDataStep } from '../components/register/RegisterSteps';
import { RegisterStepper } from '../components/register/RegisterStepper';

const RegisterNav = () => {
  const navigate = useNavigate();
  return <header className="sticky top-0 z-[900] border-b border-sky-100 bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
      <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 rounded-xl font-headline text-lg font-black text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><img src={logoSimple} alt="" className="h-9 w-9 object-contain" /> ParkingPaTi</button>
      <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-600 sm:inline">¿Ya tienes una cuenta?</span><Button variant="outline" onClick={() => navigate('/login')}>Iniciar sesión</Button></div>
    </div>
  </header>;
};

export const RegisterView = () => {
  const navigate = useNavigate();
  const register = useRegisterController();
  const renderStep = () => {
    if (register.step === 1) return <PersonalDataStep register={register} />;
    if (register.step === 2) return <ParkingDataStep register={register} />;
    return <DocumentStep register={register} />;
  };

  return <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-100 via-white to-blue-100 font-body text-slate-800">
    <RegisterNav />
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">Registro de propietario</p>
        <h1 className="mt-3 font-headline text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl">Registra tu parqueadero</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Crea tu cuenta de propietario y completa la información necesaria para registrar tu parqueadero.</p>
        <p className="mt-2 text-sm font-bold text-slate-500">El proceso consta de tres pasos y el registro deberá completar la validación correspondiente.</p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl"><RegisterStepper step={register.step} maxStep={register.maxStep} errors={register.errors} onStep={register.goToStep} /></div>
      {register.recovered && <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 sm:flex-row sm:items-center sm:justify-between"><p><strong>Recuperamos el progreso de tu registro.</strong> Por seguridad debes ingresar nuevamente la identificación, las contraseñas y el archivo.</p><button type="button" onClick={register.discardDraft} className="shrink-0 font-bold text-primary underline-offset-4 hover:underline">Descartar borrador</button></div>}

      <section className="mt-8 min-w-0 rounded-[30px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_-15px_rgba(11,19,41,0.15)] sm:p-8 lg:p-12">
          <form className="mt-9" onSubmit={register.step === 3 ? register.requestSubmit : register.continueStep} noValidate>
            {register.errors.formulario && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{register.errors.formulario}</div>}
            <div key={register.step} className="motion-safe:animate-[owner-view-enter_200ms_ease-out]">{renderStep()}</div>
            <footer className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              {register.step === 1
                ? <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/login')}>Volver al inicio de sesión</Button>
                : <Button variant="outline" className="w-full sm:w-auto" disabled={register.isSaving} onClick={register.previousStep}>Atrás</Button>}
              <Button type="submit" className="w-full sm:w-auto" isLoading={register.isSaving} loadingLabel="Enviando solicitud...">{register.step === 3 ? 'Enviar solicitud' : 'Continuar'}</Button>
            </footer>
          </form>
      </section>
      <p className="mt-8 text-center text-sm text-slate-600">¿Ya tienes una cuenta? <button type="button" onClick={() => navigate('/login')} className="font-black text-primary underline-offset-4 hover:underline">Inicia sesión</button></p>
    </main>

    <RegisterDialog open={register.confirmOpen} closeable={!register.isSaving} onClose={register.closeConfirm} title="Confirmar envío" actions={<><Button variant="outline" onClick={register.closeConfirm} disabled={register.isSaving}>Seguir revisando</Button><Button onClick={register.confirmSubmit} isLoading={register.isSaving} loadingLabel="Enviando solicitud...">Enviar solicitud</Button></>}>
      <p>Revisa que los datos y el documento sean correctos. Al finalizar, enviaremos un enlace para verificar tu correo.</p>
      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-amber-900">La solicitud pasará automáticamente a revisión administrativa después de verificar el correo.</p>
    </RegisterDialog>

    <RegisterDialog open={Boolean(register.success)} closeable={false} onClose={() => {}} title="Registro recibido" actions={<><Button variant="outline" onClick={() => navigate('/')}>Volver al inicio</Button><Button onClick={() => navigate('/login')}>Ir al inicio de sesión</Button></>}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check aria-hidden="true" size={25} /></div>
      <p className="mt-4">Guardamos el registro de <strong>{register.success?.parqueadero}</strong>. Enviamos el enlace de verificación a <strong className="break-all">{register.success?.correo}</strong>.</p>
      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4"><p className="font-bold text-sky-950">Estado inicial: verificación de correo pendiente</p><p className="mt-1 text-sky-900">Próximo paso: verifica el correo. Después, la solicitud quedará en revisión administrativa sin repetir los datos iniciales.</p></div>
      <p className="mt-4 inline-flex items-center gap-2 text-slate-500"><LockKeyhole aria-hidden="true" size={17} /> No vuelvas a enviar el formulario.</p>
    </RegisterDialog>
  </div>;
};
