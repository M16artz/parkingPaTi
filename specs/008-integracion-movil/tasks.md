# Tareas de fase 008

- [x] `docs` Resolver DP-11; mantener solo anónimo si sigue pendiente. Evidencia: `docs/product/03-decisiones-pendientes.md` limita el móvil al conductor anónimo.
- [x] `mobile` Instalar dependencias locales con versión Expo aprobada. Evidencia: `package-lock.json` y check Expo exitoso.
- [x] `mobile` Corregir tsconfig y typecheck base. Evidencia: `npm.cmd run typecheck` sin errores.
- [x] `mobile` Añadir/configurar TanStack Query. Evidencia: `src/query/queryClient.ts` y provider en `App.tsx`.
- [x] `mobile` Crear configuración API/tiles por ambiente sin IP hardcodeada. Evidencia: `.env.example` y `src/config/environment.ts`.
- [x] `mobile` Implementar tipos/adapter desde contrato público. Evidencia: `src/types/publicParking.ts` y `src/services/publicParkingApi.ts`.
- [x] `mobile` Eliminar parqueaderos hardcodeados y login propietario falso. Evidencia: context y pantallas mock retirados.
- [x] `mobile` Implementar lista, mapa y detalle anónimos. Evidencia: pantallas en `src/screens/`.
- [x] `mobile` Integrar `react-native-maps` y atribución aplicable. Evidencia: bbox Loja, `UrlTile` opcional y atribución visible.
- [x] `mobile` Implementar polling/focus/AppState y estados de red. Evidencia: hooks de ciclo de vida/consulta y estados UI.
- [x] `tests` Probar adapter, render states y pausa en background. Evidencia: 3 suites y 10 tests en `evidence.md`.
- [ ] `tests` Ejecutar smoke Android contra staging HTTPS.
- [x] `docs` Documentar configuración/limitaciones móviles. Evidencia: `frontend-movil/README.md`, arquitectura y `evidence.md`.
