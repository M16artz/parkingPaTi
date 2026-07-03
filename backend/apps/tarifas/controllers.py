"""
Controladores REST de tarifas, incrementos y descuentos.
"""

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.tarifas.serializers_dto import (
    DescuentoTarifaDTO,
    EstrategiaTarifaDTO,
    IncrementoTarifaDTO,
)
from apps.tarifas.services import (
    DescuentoTarifaService,
    EstrategiaTarifaService,
    IncrementoTarifaService,
)


class EstrategiaTarifaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        tarifas = EstrategiaTarifaService.listar(parqueadero_id)
        return Response(EstrategiaTarifaDTO(tarifas, many=True).data)

    def create(self, request):
        dto = EstrategiaTarifaDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        
        tarifa = EstrategiaTarifaService.crear(
            parqueadero_id=dto.validated_data["parqueadero"].id,
            precio_hora=dto.validated_data["precio_hora"],
            cuenta_solicitante=request.user,
        )
        return Response(EstrategiaTarifaDTO(tarifa).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        tarifa = EstrategiaTarifaService.obtener(pk)
        return Response(EstrategiaTarifaDTO(tarifa).data)

    def update(self, request, pk=None):
        dto = EstrategiaTarifaDTO(data=request.data, partial=False)
        dto.is_valid(raise_exception=True)
        
        tarifa = EstrategiaTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(EstrategiaTarifaDTO(tarifa).data)

    def partial_update(self, request, pk=None):
        dto = EstrategiaTarifaDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        
        tarifa = EstrategiaTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(EstrategiaTarifaDTO(tarifa).data)

    def destroy(self, request, pk=None):
        EstrategiaTarifaService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class IncrementoTarifaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        incrementos = IncrementoTarifaService.listar(parqueadero_id)
        return Response(IncrementoTarifaDTO(incrementos, many=True).data)

    def create(self, request):
        dto = IncrementoTarifaDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        
        incremento = IncrementoTarifaService.crear(
            parqueadero_id=dto.validated_data["parqueadero"].id,
            precio_hora=dto.validated_data["precio_hora"],
            porcentaje=dto.validated_data["porcentaje"],
            cuenta_solicitante=request.user,
        )
        return Response(IncrementoTarifaDTO(incremento).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        incremento = IncrementoTarifaService.obtener(pk)
        return Response(IncrementoTarifaDTO(incremento).data)

    def update(self, request, pk=None):
        dto = IncrementoTarifaDTO(data=request.data, partial=False)
        dto.is_valid(raise_exception=True)
        
        incremento = IncrementoTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(IncrementoTarifaDTO(incremento).data)

    def partial_update(self, request, pk=None):
        dto = IncrementoTarifaDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        
        incremento = IncrementoTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(IncrementoTarifaDTO(incremento).data)

    def destroy(self, request, pk=None):
        IncrementoTarifaService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DescuentoTarifaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        parqueadero_id = request.query_params.get("parqueadero")
        descuentos = DescuentoTarifaService.listar(parqueadero_id)
        return Response(DescuentoTarifaDTO(descuentos, many=True).data)

    def create(self, request):
        dto = DescuentoTarifaDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        
        descuento = DescuentoTarifaService.crear(
            parqueadero_id=dto.validated_data["parqueadero"].id,
            precio_hora=dto.validated_data["precio_hora"],
            porcentaje=dto.validated_data["porcentaje"],
            cuenta_solicitante=request.user,
        )
        return Response(DescuentoTarifaDTO(descuento).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        descuento = DescuentoTarifaService.obtener(pk)
        return Response(DescuentoTarifaDTO(descuento).data)

    def update(self, request, pk=None):
        dto = DescuentoTarifaDTO(data=request.data, partial=False)
        dto.is_valid(raise_exception=True)
        
        descuento = DescuentoTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(DescuentoTarifaDTO(descuento).data)

    def partial_update(self, request, pk=None):
        dto = DescuentoTarifaDTO(data=request.data, partial=True)
        dto.is_valid(raise_exception=True)
        
        descuento = DescuentoTarifaService.actualizar(pk, request.user, **dto.validated_data)
        return Response(DescuentoTarifaDTO(descuento).data)

    def destroy(self, request, pk=None):
        DescuentoTarifaService.eliminar(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
        