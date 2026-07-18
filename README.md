# ParkingPaTi: ejecución local

## Requisitos

- Node 22 LTS (ver `.nvmrc`).
- Python 3.13.
- PostgreSQL escuchando en `localhost:5432`.
- Un `backend/.env` local e ignorado, basado en `backend/.env.example`, cuando
  PostgreSQL requiera contraseña o use valores distintos de los predeterminados.

No copies secretos al repositorio y no ejecutes `npm audit fix --force`: puede
romper las versiones compatibles de Expo.

## Preparar el entorno

Desde PowerShell, en la raíz:

```powershell
.\scripts\setup-local.cmd
```

El script recrea `backend/venv` si quedó enlazado a un Python que ya no existe,
instala los lockfiles y comprueba PostgreSQL. No crea archivos `.env`.
Si detecta un servidor Django usando ese venv, pide cerrarlo antes de continuar
para que Windows no bloquee ejecutables o dependencias compiladas.
También aplica las migraciones pendientes a la base local configurada.

## Probar la web en el navegador

```powershell
.\scripts\start-local.cmd
```

Abrir `http://localhost:5173`. Vite envía `/api` a Django en
`http://localhost:8000`, de modo que registro, login, paneles y mapa se prueban
contra el backend local. `Ctrl+C` detiene ambos procesos.

## Probar la app móvil con Expo Go

Expo Go ejecuta `frontend-movil`; no sirve la aplicación web Vite. La fase 008
exige que el dispositivo consuma un Django de staging por HTTPS, no localhost
ni una IP privada.

1. Crear `frontend-movil/.env` local e ignorado a partir de `.env.example`.
2. Definir `EXPO_PUBLIC_API_BASE_URL=https://<backend>/api/v1` con la URL real
   de staging, sin versionarla.
3. Ejecutar:

```powershell
Set-Location frontend-movil
npm.cmd start
```

4. Con el teléfono y el equipo en la misma red, escanear el QR con Expo Go.
   Si la red bloquea LAN, usar temporalmente `npx.cmd expo start --tunnel`.

El cierre formal de la fase requiere validar lista, mapa, detalle y dos ciclos
de polling contra staging HTTPS según `docs/qa/mobile-staging-smoke.md`.
