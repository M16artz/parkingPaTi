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
