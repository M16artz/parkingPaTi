from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Documento
from .serializers_dto import DocumentoLecturaDTO, DocumentoEscrituraDTO

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    permission_classes = [IsAuthenticated] 

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return DocumentoLecturaDTO
        
        return DocumentoEscrituraDTO