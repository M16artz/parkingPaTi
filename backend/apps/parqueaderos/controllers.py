from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Parqueadero, Espacio
from .serializers_dto import (
    ParqueaderoConductorDTO, 
    ParqueaderoPropietarioDTO, 
    EspacioDTO
)

class ParqueaderoViewSet(viewsets.ModelViewSet):
    """
    Controlador para gestionar la entidad Parqueadero.
    """
    queryset = Parqueadero.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        Determina el DTO a usar según el rol del usuario y la acción.
        """
        # [Inferencia] Asumo que tu modelo 'Cuenta' tiene el atributo 'rol'.
        # Si el usuario es un conductor (o no es admin/propietario), recibe el DTO público
        usuario = self.request.user
        
        # Si es una petición de modificación (POST, PUT, PATCH), forzamos el DTO de escritura
        if self.action in ['create', 'update', 'partial_update']:
            return ParqueaderoPropietarioDTO
            
        # Si es lectura, verificamos el rol
        if hasattr(usuario, 'rol') and usuario.rol in ['PROPIETARIO', 'ADMINISTRADOR']:
            return ParqueaderoPropietarioDTO
            
        return ParqueaderoConductorDTO


class EspacioViewSet(viewsets.ModelViewSet):
    """
    Controlador para gestionar los espacios individuales de cada parqueadero.
    """
    queryset = Espacio.objects.all()
    serializer_class = EspacioDTO
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Permite filtrar los espacios pertenecientes a un parqueadero específico.
        Ejemplo: GET /espacios/?parqueadero=1
        """
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset