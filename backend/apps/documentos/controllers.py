"""Controladores REST de documentos, bajo /api/documentos/."""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.documentos.services import DocumentoService
from core.permissions import EsAdministrador
from .models import Documento
from rest_framework.exceptions import PermissionDenied
from core.permissions import es_administrador
from .serializers_dto import DocumentoLecturaDTO, DocumentoEscrituraDTO

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        # Utilizamos el DTO de lectura para ver (list, retrieve) y al retornar la validación.
        if self.action in ['list', 'retrieve', 'validar']:
            return DocumentoLecturaDTO
        
        # Para create, update, partial_update usamos el de escritura.
        return DocumentoEscrituraDTO

    def get_queryset(self):
        user = self.request.user
        
        # Si un administrador necesita ver todo, puedes descomentar la siguiente línea:
        # if user.is_staff: return Documento.objects.all()
        
        # Ajusta 'cuenta_id' o 'cuenta' según cómo esté definido el campo en tu modelo Documento
        return Documento.objects.filter(cuenta=user)

    def create(self, request, *args, **kwargs):
        # Usar el serializer de escritura para validar
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        archivo = serializer.validated_data.get('archivo')
        fecha_exp = serializer.validated_data.get('fecha_expiracion')
        
        # El servicio retorna la instancia creada
        documento = DocumentoService.subir_documento(request.user, archivo, fecha_exp)
        
        # Serializar la instancia con el serializer de lectura
        output_serializer = DocumentoLecturaDTO(documento)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        """
        Reemplaza el destroy() anterior. DRF obtiene la instancia automáticamente,
        y nosotros usamos tu servicio para ejecutar la lógica de eliminación.
        """
        if not es_administrador(self.request.user) and instance.cuenta_id != self.request.user.id:
            raise PermissionDenied("No tienes permiso para eliminar este documento.")
        DocumentoService.eliminar(instance.id, self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[EsAdministrador])
    def validar(self, request, pk=None):
        """POST /api/documentos/{id}/validar/ - solo administradores."""
        documento = DocumentoService.validar_documento(pk)
        
        # Obtenemos el serializador de lectura usando el método dinámico
        serializer = self.get_serializer(documento)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        archivo = serializer.validated_data.get('archivo')
        fecha_exp = serializer.validated_data.get('fecha_expiracion')
        
        documento = DocumentoService.actualizar_documento(kwargs['pk'], request.user, archivo, fecha_exp)
        return Response(DocumentoLecturaDTO(documento).data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
