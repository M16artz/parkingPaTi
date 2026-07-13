from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.parqueaderos.public_serializers_dto import (
    PublicParkingDetailDTO,
    PublicParkingListDTO,
    PublicParkingQueryDTO,
)
from apps.parqueaderos.public_services import PublicParkingService


class PublicParkingListAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PublicParkingListDTO

    @extend_schema(
        operation_id="public_parkings_list",
        parameters=[
            OpenApiParameter(
                name="bbox",
                required=True,
                type=str,
                description="minLng,minLat,maxLng,maxLat dentro de Loja",
            )
        ],
        responses=PublicParkingListDTO,
    )
    def get(self, request):
        query = PublicParkingQueryDTO(data=request.query_params)
        query.is_valid(raise_exception=True)
        resultado = PublicParkingService.listar_por_bbox(query.validated_data["bbox"])
        return Response(PublicParkingListDTO(resultado).data)


class PublicParkingDetailAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PublicParkingDetailDTO

    @extend_schema(operation_id="public_parkings_retrieve", responses=PublicParkingDetailDTO)
    def get(self, request, parqueadero_id):
        parqueadero = PublicParkingService.obtener_detalle(parqueadero_id)
        return Response(PublicParkingDetailDTO(parqueadero).data)
