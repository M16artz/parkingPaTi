from apps.estancias.models import Estancia, EstadoEstancia


class EstanciaRepository:
    @staticmethod
    def obtener_activa_por_espacio(espacio_id):
        return Estancia.objects.select_related(
            "espacio__parqueadero", "tarifa"
        ).filter(
            espacio_id=espacio_id,
            estado=EstadoEstancia.ACTIVA,
        ).first()

    @staticmethod
    def bloquear_activa_por_espacio(espacio_id):
        return Estancia.objects.select_for_update().select_related(
            "espacio__parqueadero", "tarifa"
        ).filter(
            espacio_id=espacio_id,
            estado=EstadoEstancia.ACTIVA,
        ).first()

    @staticmethod
    def crear(**datos):
        return Estancia.objects.create(**datos)

    @staticmethod
    def guardar(estancia, update_fields=None):
        estancia.save(update_fields=update_fields)
        return estancia

    @staticmethod
    def listar_finalizadas_desde(fecha_desde, propietario_id=None):
        queryset = Estancia.objects.select_related(
            "espacio__parqueadero", "tarifa"
        ).filter(
            estado=EstadoEstancia.FINALIZADA,
            fin__gte=fecha_desde,
        )
        if propietario_id is not None:
            queryset = queryset.filter(espacio__parqueadero__propietario_id=propietario_id)
        return queryset.order_by("-fin", "-id")

    @staticmethod
    def eliminar_vencidas(fecha_limite):
        eliminadas, _ = Estancia.objects.filter(
            estado__in=[EstadoEstancia.FINALIZADA, EstadoEstancia.CANCELADA],
            fin__lte=fecha_limite,
        ).delete()
        return eliminadas
