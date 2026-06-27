"""
Patron Repository para parqueaderos y espacios.
"""

from apps.parqueaderos.models import Direccion, Espacio, Parqueadero, TipoEstado, Ubicacion


class ParqueaderoRepository:
    @staticmethod
    def listar(solo_validados=True):
        # Cambiado "cuenta" por "propietario"
        qs = Parqueadero.objects.select_related("direccion", "ubicacion", "propietario")
        if solo_validados:
            qs = qs.filter(estado=True, validado=True)
        return qs

    @staticmethod
    def obtener_por_id(parqueadero_id):
        # Cambiado "cuenta" por "propietario"
        return Parqueadero.objects.select_related(
            "direccion", "ubicacion", "propietario"
        ).filter(id=parqueadero_id).first()

    @staticmethod
    def crear(propietario, direccion_datos, ubicacion_datos, **datos_parqueadero):
        # EL ORDEN CAMBIÓ: El modelo exige que Parqueadero exista primero
        parqueadero = Parqueadero.objects.create(
            propietario=propietario, 
            **datos_parqueadero
        )
        
        Direccion.objects.create(parqueadero=parqueadero, **direccion_datos)
        Ubicacion.objects.create(parqueadero=parqueadero, **ubicacion_datos)
        
        return parqueadero

    @staticmethod
    def actualizar(parqueadero, **datos):
        for campo, valor in datos.items():
            setattr(parqueadero, campo, valor)
        parqueadero.save()
        return parqueadero

    @staticmethod
    def eliminar(parqueadero):
        parqueadero.delete()

    @staticmethod
    def por_propietario(propietario_id):
        # Actualizado para filtrar por propietario_id
        return Parqueadero.objects.filter(propietario_id=propietario_id)


class EspacioRepository:
    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return Espacio.objects.filter(parqueadero_id=parqueadero_id)

    @staticmethod
    def obtener_por_id(espacio_id):
        return Espacio.objects.select_related("parqueadero").filter(id=espacio_id).first()

    @staticmethod
    def crear(parqueadero, numero_espacio, estado=TipoEstado.LIBRE):
        # Se requiere inyectar el nuevo campo "numero_espacio"
        return Espacio.objects.create(
            parqueadero=parqueadero, 
            numero_espacio=numero_espacio, 
            estado=estado
        )

    @staticmethod
    def actualizar_estado(espacio, nuevo_estado):
        espacio.estado = nuevo_estado
        espacio.save(update_fields=["estado"])
        return espacio

    @staticmethod
    def eliminar(espacio):
        espacio.delete()

    @staticmethod
    def contar_disponibles(parqueadero_id):
        return Espacio.objects.filter(
            parqueadero_id=parqueadero_id, estado=TipoEstado.LIBRE
        ).count()