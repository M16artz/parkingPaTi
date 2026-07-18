# Cliente web ParkingPaTi

Aplicación React/Vite para los flujos web y la consulta pública anónima.

## Desarrollo local

Con Django escuchando en `http://localhost:8000`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir `http://localhost:5173`. Durante desarrollo, Vite redirige `/api` y
`/health` hacia Django, por lo que no hace falta crear un `.env` para el caso
local normal y las cookies conservan el mismo origen del navegador.

`VITE_DEV_API_TARGET` permite cambiar únicamente el destino del proxy de
desarrollo. `VITE_API_BASE_URL` se reserva para una API pública desplegada.
Ninguna variable `VITE_*` debe contener secretos.

## Verificación

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```
