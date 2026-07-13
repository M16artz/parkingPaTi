---
name: mobile-expo-react-native
description: Implementar o revisar el cliente Expo/React Native de ParkingPaTi para consulta pública anónima con React Query y react-native-maps. Usar en instalación móvil, adapters REST, mapa, lista, detalle, polling y configuración por ambiente.
---

# Móvil Expo y React Native

## Cuándo usarlo

Usar en la fase 008 o correcciones móviles aprobadas. Leer `frontend-movil/AGENTS.md`, la spec activa y DP-11.

## Reglas obligatorias

- Priorizar conductor anónimo: mapa, lista y detalle.
- No añadir cuenta de conductor.
- No implementar propietario móvil mientras DP-11 no lo apruebe.
- Usar OpenAPI/adapters REST y React Query.
- Usar `react-native-maps` con región de Loja.
- Polling a 5000 ms con pausa mediante AppState/focus.
- Configurar API/tiles por ambiente y HTTPS.
- Guardar tokens en SecureStore solo si un flujo autenticado aprobado lo requiere.

## Antipatrones prohibidos

- IP privada, datos o credenciales hardcodeadas.
- Context con parqueaderos demo como fuente final.
- Login que acepta campos no vacíos.
- WebSockets/Channels.
- Acceso directo a Supabase o API OSM para datos.
- Polling en background.
- Contratos móviles distintos del OpenAPI.

## Checklist de salida

- [ ] Dependencias locales/Expo son compatibles.
- [ ] Typecheck y tests pasan.
- [ ] Loading/error/empty/data y red lenta están cubiertos.
- [ ] Polling pausa/reanuda correctamente.
- [ ] Smoke Android usa staging HTTPS.
- [ ] No quedan mocks permanentes ni IPs locales.
