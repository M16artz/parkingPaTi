// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Check, Car, ShieldCheck, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Componentes Atómicos Reutilizables
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Solución al bug nativo de Leaflet para la renderización de iconos
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ============================================================================
// 2. CONSTANTES DE CONFIGURACIÓN
// ============================================================================
const LOJA_BOUNDS = [
  [-4.0500, -79.2500], 
  [-3.9500, -79.1500]  
];
const ID_OPTIONS = ['Cédula de Ciudadanía', 'Pasaporte', 'RUC'];
const DEFAULT_COORDS = { lat: "-3.9931", lng: "-79.2042" };

// ============================================================================
// 3. COMPONENTE MODULAR (Manejador de eventos del Mapa)
// ============================================================================
const LocationMarker = ({ coords, setCoords }) => {
  useMapEvents({
    click(e) {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;

      if (
        clickedLat >= LOJA_BOUNDS[0][0] && clickedLat <= LOJA_BOUNDS[1][0] &&
        clickedLng >= LOJA_BOUNDS[0][1] && clickedLng <= LOJA_BOUNDS[1][1]
      ) {
        setCoords({ 
          lat: clickedLat.toFixed(6), 
          lng: clickedLng.toFixed(6) 
        });
      } else {
        alert("Por favor, selecciona una ubicación válida dentro de Loja.");
      }
    },
  });

  return coords ? <Marker position={[coords.lat, coords.lng]} /> : null;
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL (VISTA DE REGISTRO)
// ============================================================================
export const RegisterView = () => {
  const navigate = useNavigate();

  // Estados Generales
  const [step, setStep] = useState(1); 
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  // Estados del Paso 1 (Datos Personales)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isOpenIdMenu, setIsOpenIdMenu] = useState(false);
  const [selectedIdType, setSelectedIdType] = useState(ID_OPTIONS[0]);
  const [email, setEmail] = useState(''); 

  // Estados del Paso 2 (Ubicación del Parqueadero)
  const [parkingName, setParkingName] = useState('');
  const [mainStreet, setMainStreet] = useState('');
  const [sideStreet, setSideStreet] = useState('');
  const [lotNumber, setLotNumber] = useState(''); 
  const [coords, setCoords] = useState(DEFAULT_COORDS);

  // Efectos Visuales y de Flujo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Manejadores de Interacción
  const handleNextStep = () => {
    if (step === 2) {
      console.log("Datos listos:", { parkingName, mainStreet, sideStreet, lotNumber, ...coords });
    }
    
    if (step === 3) {
      console.log("Enviando al Backend:", { firstName, lastName, selectedIdType, idNumber, email, password, parkingName, mainStreet, sideStreet, lotNumber, ...coords });
      setShowSuccessModal(true);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div 
    
      className={
        "min-h-screen " + 
        "bg-bg " + 
        "to-slate-100 " + 
        "flex " + 
        "flex-col " + 
        "items-center " + 
        "select-none " + 
        "overflow-x-hidden " + 
        "relative"
      }
    >
      {/* NAVBAR SUPERIOR ESTÁTICA */}
      <nav 
        className={
          "w-full " + 
          "bg-white/80 " + 
          "backdrop-blur-md " + 
          "py-6 " + 
          "px-12 " + 
          "flex " + 
          "items-center " + 
          "border-b " + 
          "border-slate-200 " + 
          "shadow-sm " + 
          "z-30"
        }
      >
        <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/home')}>
          <Car size={32} />
          <span className="text-xl font-bold font-headline tracking-wide text-primary">ParkingPaTi</span>
        </div>
      </nav>

      {/* CONTENEDOR ENVOLVENTE */}
      <div 
        className={`
          w-full max-w-5xl 
          px-6 py-12 
          transition-all duration-700 ease-out 
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}
      >
        
        {/* Cabecera Informativa */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4 tracking-tight">
            Registra tu Espacio de Parqueo
          </h1>
          <p className="text-slate-500 text-lg font-body">
            Únete a nuestra red y empieza a gestionar tus espacios eficientemente.
          </p>
        </div>

        {/* STEPPER / LÍNEA DE TIEMPO */}
        <div className="flex items-center justify-center mb-12 relative max-w-2xl mx-auto px-4">
          <div className="absolute h-1 bg-slate-200 w-[80%] top-6 left-[10%] z-0 rounded-full"></div>
          <div className="absolute h-1 bg-primary top-6 left-[10%] z-0 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${(step - 1) * 40}%` }}></div>
          
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative z-10 flex flex-col items-center flex-1">
              <button 
                type="button"
                onClick={() => item < step && setStep(item)} 
                disabled={item >= step} 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold ${step > item ? 'bg-primary border-primary text-white shadow-md shadow-primary/30 scale-105' : step === item ? 'bg-white border-primary text-primary shadow-lg scale-110 ring-4 ring-primary/10' : 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'}`}
              >
                {step > item ? <Check size={20} strokeWidth={3} /> : item}
              </button>
              <span className={`mt-3 text-xs font-bold uppercase tracking-wider text-center font-label ${step === item || step > item ? 'text-slate-800 font-extrabold' : 'text-slate-400'}`}>
                {item === 1 ? 'Datos Personales' : item === 2 ? 'Ubicación' : 'Documentos'}
              </span>
            </div>
          ))}
        </div>

        {/* TARJETA BLANCA PRINCIPAL */}
        <div 
          className={
            "relative " + 
            "bg-white " + 
            "rounded-[32px] " + 
            "shadow-[0_25px_60px_-15px_rgba(11,19,41,0.15)] " + 
            "p-8 " + 
            "md:p-12 " + 
            "border " + 
            "border-slate-100 " + 
            "min-h-[400px] " + 
            "flex " + 
            "flex-col " + 
            "justify-between"
          }
        >
          
          {/* NOTIFICACIÓN POR EMAIL FLOTANTE */}
          {step === 3 && (
            <div className="absolute top-6 right-8 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm animate-fadeIn max-w-[280px] md:max-w-xs overflow-hidden">
              <Mail size={14} className="text-primary shrink-0" />
              <div className="text-left leading-tight truncate">
                <span className="block text-[10px] text-sky-600 font-bold uppercase tracking-wider font-label">Se notificará a:</span>
                <span className="text-xs font-bold text-slate-900 font-body block truncate">{email || 'Sin correo registrado'}</span>
              </div>
            </div>
          )}

          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <div 
              className={
                "grid " + 
                "grid-cols-1 " + 
                "md:grid-cols-2 " + 
                "gap-6 " + 
                "animate-fadeIn"
              }
            >
              <div className="md:col-span-2">
                <Input label="Nombres" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ingresa tus nombres" className="!max-w-full" />
              </div>
              <div className="md:col-span-2">
                <Input label="Apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ingresa tus apellidos" className="!max-w-full" />
              </div>
              
              <div className="relative mb-4">
                <label className="block text-sm font-bold text-tertiary font-body mb-1.5 ml-1">Tipo de Identificación</label>
                <div 
                  onClick={() => setIsOpenIdMenu(!isOpenIdMenu)} 
                  className={
                    "w-full " + 
                    "py-3 " + 
                    "px-4 " + 
                    "rounded-xl " + 
                    "border " + 
                    "border-gray-200 " + 
                    "outline-none " + 
                    "transition-all " + 
                    "duration-200 " + 
                    "font-body " + 
                    "text-tertiary " + 
                    "bg-white " + 
                    "shadow-sm " + 
                    "flex " + 
                    "items-center " + 
                    "justify-between " + 
                    "cursor-pointer " + 
                    "select-none"
                  }
                >
                  <span>{selectedIdType}</span>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isOpenIdMenu ? 'rotate-180' : ''}`} />
                </div>
                
                {isOpenIdMenu && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    {ID_OPTIONS.map((option) => (
                      <div key={option} onClick={() => { setSelectedIdType(option); setIsOpenIdMenu(false); }} className="px-4 py-3 text-sm text-slate-700 hover:bg-sky-50 hover:text-primary cursor-pointer transition-colors font-body font-bold">
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Input label="Número de Identificación" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Ej. 1726354210" className="!max-w-full" />
              
              <div className="md:col-span-2">
                <Input label="Correo electrónico / Usuario" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" className="!max-w-full" />
              </div>
              <div className="md:col-span-2">
                <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="!max-w-full" />
              </div>
            </div>
          )}

          {/* PASO 2: DETALLES DEL PARQUEADERO */}
          {step === 2 && (
            <div 
              className={
                "grid " + 
                "grid-cols-1 " + 
                "lg:grid-cols-12 " + 
                "gap-8 " + 
                "animate-fadeIn"
              }
            >
              <div className="lg:col-span-5 space-y-2">
                <Input label="Nombre del Parqueadero" value={parkingName} onChange={(e) => setParkingName(e.target.value)} placeholder="Ej. Central Park Plaza" className="!max-w-full" />
                <Input label="Calle Principal" value={mainStreet} onChange={(e) => setMainStreet(e.target.value)} placeholder="Ej. 18 de Noviembre" className="!max-w-full" />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Calle Secundaria" value={sideStreet} onChange={(e) => setSideStreet(e.target.value)} placeholder="Ej. Colón" className="!max-w-full" />
                  <Input label="Número de Lote" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="Ej. 14B" className="!max-w-full" />
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col">
                <label className="block text-sm font-bold text-tertiary font-body mb-1.5 ml-1">Ubica el parqueadero en el mapa</label>
                
                <div 
                  className={
                    "relative " + 
                    "w-full " + 
                    "h-[300px] " + 
                    "rounded-2xl " + 
                    "border " + 
                    "border-slate-200 " + 
                    "overflow-hidden " + 
                    "shadow-inner " + 
                    "z-10"
                  }
                >
                  <MapContainer center={[DEFAULT_COORDS.lat, DEFAULT_COORDS.lng]} zoom={14} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1.0} minZoom={13} className="w-full h-full">
                    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker coords={coords} setCoords={setCoords} />
                  </MapContainer>

                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-xl shadow-md z-[1000] text-xs font-bold text-slate-700 font-body">
                    Lat: {coords.lat}, Lng: {coords.lng}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: DOCUMENTACIÓN */}
          {step === 3 && (
            <div 
              className={
                "space-y-6 " + 
                "max-w-xl " + 
                "mx-auto " + 
                "w-full " + 
                "text-center " + 
                "py-4 " + 
                "animate-fadeIn"
              }
            >
              <div className="mx-auto w-16 h-16 bg-sky-50 text-primary rounded-2xl flex items-center justify-center mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-headline">Sube tu Documento de Verificación</h3>
              <p className="text-slate-500 font-body text-sm mb-6">Por seguridad de la plataforma, requerimos una foto legible del permiso de funcionamiento del Parqueadero.</p>
              
              <div 
                className={
                  "border-2 " + 
                  "border-dashed " + 
                  "border-slate-200 " + 
                  "hover:border-primary " + 
                  "rounded-2xl " + 
                  "p-8 " + 
                  "transition-colors " + 
                  "cursor-pointer " + 
                  "bg-slate-50/50"
                }
              >
                <span className="text-sm font-bold text-primary font-label block">Seleccionar Archivo</span>
                <span className="text-xs text-slate-400 font-body mt-1 block">PDF, PNG o JPG (Máx. 5MB)</span>
              </div>
            </div>
          )}

          {/* CONTROLES DE NAVEGACIÓN */}
          <div 
            className={
              "mt-12 " + 
              "pt-6 " + 
              "border-t " + 
              "border-slate-100 " + 
              "flex " + 
              "items-center " + 
              "justify-between"
            }
          >
            {step > 1 ? (
              <button 
                type="button"
                onClick={prevStep} 
                className={
                  "border-2 " + 
                  "border-slate-200 " + 
                  "hover:border-slate-300 " + 
                  "text-slate-600 " + 
                  "px-8 " + 
                  "py-3.5 " + 
                  "rounded-2xl " + 
                  "font-bold " + 
                  "font-label " + 
                  "flex " + 
                  "items-center " + 
                  "gap-2 " + 
                  "transition-all " + 
                  "hover:bg-slate-50 " + 
                  "active:scale-95"
                }
              >
                <ArrowLeft size={18} /> Volver
              </button>
            ) : <div />}

            <Button 
              variant="primary"
              onClick={handleNextStep}
              className={
                "px-10 " + 
                "py-4 " + 
                "rounded-2xl " + 
                "font-bold " + 
                "font-label " + 
                "flex " + 
                "items-center " + 
                "gap-3 " + 
                "shadow-xl " + 
                "shadow-primary/20 " + 
                "hover:scale-105 " + 
                "transition-all " + 
                "active:scale-95"
              }
            >
              {step === 1 && <>Continuar a Detalles <ArrowRight size={20} /></>}
              {step === 2 && <>Continuar a Documentos <ArrowRight size={20} /></>}
              {step === 3 && <>Finalizar Registro <ShieldCheck size={20} /></>}
            </Button>
          </div>
        </div>

        {/* Enlace al Login */}
        <div className="mt-8 text-center">
          <button type="button" onClick={() => navigate('/login')} className="text-slate-400 hover:text-primary font-bold transition-colors font-body text-sm">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </button>
        </div>

      </div>

      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div 
          className={
            "fixed " + 
            "inset-0 " + 
            "bg-slate-900/60 " + 
            "backdrop-blur-sm " + 
            "flex " + 
            "items-center " + 
            "justify-center " + 
            "p-4 " + 
            "z-[9999] " + 
            "animate-fadeIn"
          }
        >
          <div 
            className={
              "bg-white " + 
              "rounded-[28px] " + 
              "max-w-md " + 
              "w-full " + 
              "p-8 " + 
              "shadow-2xl " + 
              "border " + 
              "border-slate-100 " + 
              "text-center " + 
              "transform " + 
              "scale-100 " + 
              "transition-all " + 
              "duration-300"
            }
          >
            <div className="mx-auto w-16 h-16 bg-sky-50 text-primary rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/10">
              <Check size={32} strokeWidth={3} className="animate-bounce" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 font-headline mb-3">
              ¡Registro Recibido!
            </h3>
            
            <p className="text-slate-600 font-body text-sm mb-6 leading-relaxed">
              Hemos guardado exitosamente los detalles de <span className="font-bold text-slate-800">"{parkingName || 'tu parqueadero'}"</span>. Nuestro equipo validará el permiso de funcionamiento en las próximas horas.
            </p>

            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
              <Mail size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-sky-600">Estado de la Solicitud</span>
                <p className="text-xs font-medium text-slate-700 mt-0.5 leading-snug">
                  Se enviará un correo de resolución automáticamente a: <span className="font-bold text-blue-900 block mt-0.5 break-all">{email || 'tu correo registrado'}</span>
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/login');
              }}
              className="w-full py-3.5 rounded-xl font-bold font-label shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};