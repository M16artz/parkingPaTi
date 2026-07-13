from drf_spectacular.utils import extend_schema
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.documentos.serializers_dto import DocumentoEscrituraDTO, DocumentoLecturaDTO
from apps.documentos.services import DocumentoService
from apps.parqueaderos.serializers_dto import ParqueaderoCrearDTO, ParqueaderoDetalleDTO
from apps.usuarios.onboarding_services import OnboardingService
from apps.usuarios.serializers_dto import OnboardingEstadoDTO
from core.permissions import EsPropietario


class OnboardingEstadoAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = OnboardingEstadoDTO

    def get(self, request):
        return Response(OnboardingEstadoDTO(OnboardingService.estado(request.user)).data)


class DatosInicialesParqueaderoAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = ParqueaderoCrearDTO

    @extend_schema(request=ParqueaderoCrearDTO, responses=ParqueaderoDetalleDTO)
    def put(self, request):
        dto = ParqueaderoCrearDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        parqueadero = OnboardingService.guardar_datos_iniciales(
            request.user,
            dto.to_direccion_datos(),
            dto.to_ubicacion_datos(),
            **dto.to_parqueadero_datos(),
        )
        return Response(ParqueaderoDetalleDTO(parqueadero).data)


class DocumentoOnboardingAPIView(APIView):
    permission_classes = [EsPropietario]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = DocumentoEscrituraDTO

    @extend_schema(request=DocumentoEscrituraDTO, responses=DocumentoLecturaDTO)
    def put(self, request):
        dto = DocumentoEscrituraDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        documento = DocumentoService.subir_o_reemplazar(request.user, dto.validated_data["archivo"])
        return Response(DocumentoLecturaDTO(documento).data)


class EnviarSolicitudAPIView(APIView):
    permission_classes = [EsPropietario]
    serializer_class = OnboardingEstadoDTO

    @extend_schema(request=None, responses=OnboardingEstadoDTO)
    def post(self, request):
        return Response(OnboardingEstadoDTO(OnboardingService.enviar_solicitud(request.user)).data)
