from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Persona, Cuenta
from .serializers_dto import (
    PersonaDTO, 
    CuentaLecturaDTO, 
    CuentaEscrituraDTO
)

class PersonaViewSet(viewsets.ModelViewSet):
    """
    Controlador para gestionar la entidad Persona.
    """
    queryset = Persona.objects.all()
    serializer_class = PersonaDTO
    permission_classes = [IsAuthenticated]


class CuentaViewSet(viewsets.ModelViewSet):
    #Controlador para gestionar la entidad Cuenta (autenticación y roles).

    queryset = Cuenta.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        Intercambia el DTO dependiendo de la acción HTTP.
        """
        if self.action in ['list', 'retrieve']:
            return CuentaLecturaDTO
        return CuentaEscrituraDTO