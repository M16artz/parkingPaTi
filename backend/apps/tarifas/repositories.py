from apps.tarifas.models import CategoriaTarifa, TipoCategoriaTarifa
from core.repositories import actualizar_generico


class CategoriaTarifaRepository:
    @staticmethod
    def listar(parqueadero_id=None, solo_activas=False):
        queryset = CategoriaTarifa.objects.select_related("parqueadero").all()
        if parqueadero_id is not None:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
        if solo_activas:
            queryset = queryset.filter(activa=True)
        return queryset.order_by("parqueadero_id", "codigo")

    @staticmethod
    def listar_por_parqueadero(parqueadero_id):
        return CategoriaTarifaRepository.listar(parqueadero_id=parqueadero_id)

    @staticmethod
    def obtener_por_id(categoria_id):
        return CategoriaTarifa.objects.select_related("parqueadero").filter(id=categoria_id).first()

    @staticmethod
    def obtener_por_codigo(parqueadero_id, codigo):
        return CategoriaTarifa.objects.filter(parqueadero_id=parqueadero_id, codigo=codigo).first()

    @staticmethod
    def obtener_normal(parqueadero_id):
        return CategoriaTarifaRepository.obtener_por_codigo(parqueadero_id, TipoCategoriaTarifa.NORMAL)

    @staticmethod
    def crear(parqueadero, **datos):
        return CategoriaTarifa.objects.create(parqueadero=parqueadero, **datos)

    @staticmethod
    def actualizar(categoria, **datos):
        return actualizar_generico(
            categoria,
            campos_permitidos={"nombre_visible", "precio_hora", "activa"},
            **datos,
        )

    @staticmethod
    def eliminar(categoria):
        categoria.delete()

    @staticmethod
    def bloquear_por_parqueadero(parqueadero_id):
        return list(
            CategoriaTarifa.objects.select_for_update()
            .filter(parqueadero_id=parqueadero_id)
            .order_by("codigo")
        )
