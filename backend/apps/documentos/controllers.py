from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.documentos.serializers_dto import DocumentoEscrituraDTO, DocumentoLecturaDTO
from apps.documentos.services import DocumentoService
from core.permissions import EsAdministrador


class DocumentoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = DocumentoLecturaDTO
    lookup_value_regex = r"\d+"

    def list(self, request):
        return Response(DocumentoLecturaDTO(DocumentoService.listar(request.user), many=True).data)

    def retrieve(self, request, pk=None):
        return Response(DocumentoLecturaDTO(DocumentoService.obtener(pk, request.user)).data)

    def create(self, request):
        dto = DocumentoEscrituraDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        documento = DocumentoService.subir_documento(request.user, dto.validated_data["archivo"])
        return Response(DocumentoLecturaDTO(documento).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        dto = DocumentoEscrituraDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        documento = DocumentoService.actualizar_documento(pk, request.user, dto.validated_data["archivo"])
        return Response(DocumentoLecturaDTO(documento).data)

    partial_update = update

    def destroy(self, request, pk=None):
        DocumentoService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[EsAdministrador])
    def validar(self, request, pk=None):
        documento = DocumentoService.validar_documento(pk, request.user)
        return Response(DocumentoLecturaDTO(documento).data)
