from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import EstrategiaTarifa, IncrementoTarifa, DescuentoTarifa
from .serializers_dto import (
    EstrategiaTarifaLecturaDTO, 
    EstrategiaTarifaEscrituraDTO,
    IncrementoTarifaDTO,
    DescuentoTarifaDTO
)

class EstrategiaTarifaViewSet(viewsets.ModelViewSet):
    queryset = EstrategiaTarifa.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return EstrategiaTarifaLecturaDTO
        return EstrategiaTarifaEscrituraDTO
    

    def get_queryset(self):
        queryset = super().get_queryset()
        parqueadero_id = self.request.query_params.get('parqueadero')
        
        if parqueadero_id:
            queryset = queryset.filter(parqueadero_id=parqueadero_id)
            
        return queryset


class IncrementoTarifaViewSet(viewsets.ModelViewSet):
 
    #incrementos de tarifa individuales.
    queryset = IncrementoTarifa.objects.all()
    serializer_class = IncrementoTarifaDTO
    permission_classes = [IsAuthenticated]


class DescuentoTarifaViewSet(viewsets.ModelViewSet):
    #descuentos de tarifa individuales.
    queryset = DescuentoTarifa.objects.all()
    serializer_class = DescuentoTarifaDTO
    permission_classes = [IsAuthenticated]