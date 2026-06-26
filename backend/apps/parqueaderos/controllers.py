from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Parqueadero, Espacio
from .serializers_dto import (
    ParqueaderoConductorDTO, 
    ParqueaderoPropietarioDTO, 
    EspacioDTO
)

class ParqueaderoViewSet(viewsets.ModelViewSet):
    queryset = Parqueadero.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        `[Inferencia]` Filtra el DTO adecuado basándose en la acción y en el rol del usuario autenticado.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return ParqueaderoPropietarioDTO
            
        usuario = self.request.user
        if hasattr(usuario, 'rol') and usuario.rol in ['PROPIETARIO', 'ADMINISTRADOR']:
            return ParqueaderoPropietarioDTO
            
        return ParqueaderoConductorDTO


class EspacioViewSet(viewsets.ModelViewSet):
    queryset = Espacio.objects.all()
    serializer_class = EspacioDTO
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset