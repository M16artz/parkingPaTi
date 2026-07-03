"""
Paginacion estandar para toda la API REST.
Se centraliza aqui (core/) porque es una utilidad transversal, no logica
de un dominio especifico - no pertenece a ninguna app individual.
"""

from rest_framework.pagination import PageNumberPagination


class StandardResultsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class PaginacionManualMixin:
    """
    Los controladores de este proyecto son viewsets.ViewSet "planos", no
    GenericViewSet - por eso DEFAULT_PAGINATION_CLASS (settings) NO se
    aplica automaticamente a sus list(). Este mixin da una forma de una
    sola linea para paginar manualmente en los list() que devuelven
    datasets que crecen con el tiempo (hallazgo 4.7 de la auditoria).

    Uso:
        class MiViewSet(PaginacionManualMixin, viewsets.ViewSet):
            def list(self, request):
                queryset = MiRepository.listar()
                return self.paginar(request, queryset, MiDTO)
    """

    pagination_class = StandardResultsPagination

    def paginar(self, request, queryset, serializer_class, many_kwargs=None):
        paginator = self.pagination_class()
        pagina = paginator.paginate_queryset(queryset, request, view=self)
        serializer = serializer_class(pagina, many=True, **(many_kwargs or {}))
        return paginator.get_paginated_response(serializer.data)