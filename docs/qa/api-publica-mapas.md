# API publica, mapas y polling

## Flujo anonimo web

1. `/` redirige a `/parkings` sin login.
2. El mapa se limita al bbox base de Loja.
3. Mover o ampliar el mapa calcula el viewport y espera 400 ms.
4. React Query cancela la consulta anterior y llama a Django con el bbox.
5. La lista y los marcadores usan la misma respuesta.
6. Seleccionar un parqueadero carga detalle, horarios y tarifas informativas.
7. Lista y detalle se actualizan cada 5000 ms con la pagina visible.

## Estados verificados

- Carga: muestra consulta en curso sin ocultar el mapa base.
- Vacio: informa que no existen parqueaderos en la zona.
- Error: conserva mapa y presenta reintento.
- Datos: sincroniza marcador, lista, detalle y ultima actualizacion.
- Background: detiene intervalo y cancela consultas publicas activas.

## Limites cartograficos

- Los parqueaderos vienen solo de Django/PostgreSQL.
- Leaflet solicita unicamente tiles visibles al proveedor configurado.
- La atribucion permanece visible mediante el control nativo de Leaflet.
- No existe geocodificacion, Nominatim, descarga, prefetch ni modo offline.
- DP-12 no esta confirmada para produccion; cambiar proveedor no modifica el
  contrato de parqueaderos.

## Verificacion manual

- Abrir `http://localhost:5173/parkings` con API local configurada.
- Confirmar que el marcador coincide con lista y detalle.
- Cambiar disponibilidad como propietario y observar el cambio antes de 10 s.
- Ocultar la pestana y comprobar que no se repiten solicitudes.
