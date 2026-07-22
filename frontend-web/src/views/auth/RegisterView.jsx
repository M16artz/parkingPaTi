import React from 'react';
import { Check, LockKeyhole, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRegisterController } from '../../controllers/useRegisterController';
import { Button } from '../components/Button';
import { RegisterDialog } from '../components/register/RegisterDialog';
import { DocumentStep, ParkingDataStep, PersonalDataStep } from '../components/register/RegisterSteps';
import { RegisterStepper } from '../components/register/RegisterStepper';

const RegisterNav = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-[900] w-full border-b border-slate-200 bg-white/90 backdrop-blur-md py-5 sm:py-6 px-8 sm:px-14 shadow-sm">
      <div className="flex w-full items-center justify-start">
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 text-primary font-headline text-2xl font-bold tracking-wide focus-visible:outline-none hover:opacity-90 transition-opacity"
        >
          <Car size={36} className="text-primary" />
          <span className="font-bold font-headline text-primary">ParkingPaTi</span>
        </button>
      </div>
    </header>
  );
};

export const RegisterView = () => {
  const navigate = useNavigate();
  const register = useRegisterController();

  const renderStep = () => {
    if (register.step === 1) return <PersonalDataStep register={register} />;
    if (register.step === 2) return <ParkingDataStep register={register} />;
    return <DocumentStep register={register} />;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-sky-100 font-body text-slate-800">
      <RegisterNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Cabecera Informativa */}
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4 tracking-tight">
            Registra tu Espacio de Parqueo
          </h1>
          <p className="text-slate-600 text-lg font-body">
            Únete a nuestra red y empieza a gestionar tus espacios eficientemente.
          </p>
          <p className="mt-2 text-sm font-bold text-slate-500">
            El proceso consta de tres pasos y el registro deberá completar la validación correspondiente.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-3xl">
          <RegisterStepper step={register.step} maxStep={register.maxStep} errors={register.errors} onStep={register.goToStep} />
        </div>

        {register.recovered && (
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 sm:flex-row sm:items-center sm:justify-between">
            <p><strong>Recuperamos el progreso de tu registro.</strong> Por seguridad debes ingresar nuevamente la identificación, las contraseñas y el archivo.</p>
            <button type="button" onClick={register.discardDraft} className="shrink-0 font-bold text-primary underline-offset-4 hover:underline">
              Descartar borrador
            </button>
          </div>
        )}

        <section className="mt-8 min-w-0 rounded-[30px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_-15px_rgba(11,19,41,0.15)] sm:p-8 lg:p-12">
          <form className="mt-9" onSubmit={register.step === 3 ? register.requestSubmit : register.continueStep} noValidate>
            {register.errors.formulario && (
              <div data-register-alert role="alert" tabIndex="-1" className="mb-7 rounded-2xl border-2 border-red-500 bg-red-50 p-5 text-base font-black text-red-900 shadow-lg shadow-red-200/70 ring-4 ring-red-100">
                <span className="block text-xs uppercase tracking-widest text-red-600">No se puede continuar</span>
                <span className="mt-1 block">{register.errors.formulario}</span>
              </div>
            )}
            <div key={register.step} className="motion-safe:animate-[owner-view-enter_200ms_ease-out]">
              {renderStep()}
            </div>
            <footer className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              {register.step === 1 ? (
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
                  Volver al inicio de sesión
                </Button>
              ) : (
                <Button variant="outline" className="w-full sm:w-auto" disabled={register.isSaving} onClick={register.previousStep}>
                  Atrás
                </Button>
              )}
              <Button type="submit" className="w-full sm:w-auto" isLoading={register.isSaving} loadingLabel={register.isCheckingEmail ? 'Verificando correo...' : 'Enviando solicitud...'}>
                {register.step === 3 ? 'Enviar solicitud' : 'Continuar'}
              </Button>
            </footer>
          </form>
        </section>

        <p className="mt-8 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{' '}
          <button type="button" onClick={() => navigate('/login')} className="font-black text-primary underline-offset-4 hover:underline">
            Inicia sesión
          </button>
        </p>
      </main>

      <RegisterDialog 
        open={register.confirmOpen} 
        closeable={!register.isSaving} 
        onClose={register.closeConfirm} 
        title="Confirmar envío" 
        actions={
          <>
            <Button variant="outline" onClick={register.closeConfirm} disabled={register.isSaving}>
              Seguir revisando
            </Button>
            <Button onClick={register.confirmSubmit} isLoading={register.isSaving} loadingLabel="Enviando solicitud...">
              Enviar solicitud
            </Button>
          </>
        }
      >
        <p>Revisa que los datos y el documento sean correctos. Al finalizar, enviaremos un enlace para verificar tu correo.</p>
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-amber-900">
          La solicitud pasará automáticamente a revisión administrativa después de verificar el correo.
        </p>
      </RegisterDialog>

      <RegisterDialog 
        open={Boolean(register.success)} 
        closeable={false} 
        onClose={() => {}} 
        title="Registro recibido" 
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
            <Button onClick={() => navigate('/login')}>
              Ir al inicio de sesión
            </Button>
          </>
        }
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Check aria-hidden="true" size={25} />
        </div>
        <p className="mt-4">
          Guardamos el registro de <strong>{register.success?.parqueadero}</strong>. Enviamos el enlace de verificación a <strong className="break-all">{register.success?.correo}</strong>.
        </p>
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="font-bold text-sky-950">Estado inicial: verificación de correo pendiente</p>
          <p className="mt-1 text-sky-900">Próximo paso: verifica el correo. Después, la solicitud quedará en revisión administrativa sin repetir los datos iniciales.</p>
        </div>
        <p className="mt-4 inline-flex items-center gap-2 text-slate-500">
          <LockKeyhole aria-hidden="true" size={17} /> No vuelvas a enviar el formulario.
        </p>
      </RegisterDialog>
    </div>
  );
};
