from rest_framework import serializers
from .models import HorarioAtencion

class HorarioAtencionDTO(serializers.ModelSerializer):
    """
    Serializer unificado para las operaciones CRUD de HorarioAtencion.
    """
    class Meta:
        model = HorarioAtencion
        fields = [
            'id',
            'parqueadero',
            'dia',
            'hora_apertura',
            'hora_cierre'
        ]

    def validate(self, data):
        hora_apertura = data.get('hora_apertura')
        hora_cierre = data.get('hora_cierre')

        if hora_apertura and hora_cierre:
            if hora_apertura >= hora_cierre:
                raise serializers.ValidationError(
                    "La hora de apertura debe ser anterior a la hora de cierre."
                )
        return data