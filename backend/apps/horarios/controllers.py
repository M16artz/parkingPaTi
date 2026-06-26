from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import HorarioAtencion
from .serializers_dto import HorarioAtencionDTO

class HorarioAtencionViewSet(viewsets.ModelViewSet):
    queryset = HorarioAtencion.objects.all()
    serializer_class = HorarioAtencionDTO
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ejemplo de petición: GET /horarios/?parqueadero=5
        """
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset