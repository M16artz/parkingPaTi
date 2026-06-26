from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import EstrategiaTarifa, IncrementoTarifa, DescuentoTarifa
from .serializers_dto import EstrategiaTarifaDTO, IncrementoTarifaDTO, DescuentoTarifaDTO

class EstrategiaTarifaViewSet(viewsets.ModelViewSet):
    queryset = EstrategiaTarifa.objects.all()
    serializer_class = EstrategiaTarifaDTO
    permission_classes = [IsAuthenticated]


class IncrementoTarifaViewSet(viewsets.ModelViewSet):
    queryset = IncrementoTarifa.objects.all()
    serializer_class = IncrementoTarifaDTO
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset


class DescuentoTarifaViewSet(viewsets.ModelViewSet):
    queryset = DescuentoTarifa.objects.all()
    serializer_class = DescuentoTarifaDTO
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset