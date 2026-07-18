# Estancias y costo informativo

## Flujo propietario

1. Un espacio activo y `LIBRE` muestra la accion de iniciar estancia.
2. La interfaz propone `NORMAL`; el propietario puede elegir otra tarifa
   activa del parqueadero y confirma una sola vez.
3. El backend toma snapshot y cambia el espacio a `OCUPADO` atomicamente.
4. Consultar la estancia muestra un preview sin persistir fin ni costo.
5. Confirmar finalizacion guarda el resumen, libera el espacio y presenta
   `Valor informativo`.

No se solicita placa, conductor, metodo de pago ni datos fiscales.

## Reglas de calculo

- Todo intervalo positivo menor o igual a 60 minutos aplica una hora.
- 61 minutos aplica dos horas.
- El precio usado siempre es el snapshot de inicio.
- Cambiar o desactivar la tarifa despues no altera una estancia activa.

## Acceso y retencion

- El propietario solo consulta finalizadas de su parqueadero.
- El administrador consulta finalizadas de todos los parqueaderos.
- Ningun rol recibe registros con mas de 12 meses.
- Ejecutar `python manage.py purge_expired_stays` elimina fisicamente los
  registros vencidos. La tarea programada se configura en fase 010.

## Casos de fallo esperados

- Espacio ocupado, inhabilitado o eliminado: `409`.
- Segundo inicio concurrente: uno se crea y el otro recibe `409`.
- Tarifa inactiva o ajena: `409`.
- Recurso ajeno: `403`.
- Sin estancia activa para consultar: `404`.
- Sin estancia activa para finalizar: `409`.
