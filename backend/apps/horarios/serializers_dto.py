from rest_framework import serializers
from .models import HorarioAtencion

class HorarioAtencionDTO(serializers.ModelSerializer):
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

class HorarioAtencionCrearDTO(serializers.Serializer):
    parqueadero = serializers.IntegerField()
    dia_semana = serializers.ChoiceField(choices=HorarioAtencion._meta.get_field("dia_semana").choices)
    hora_apertura = serializers.TimeField()
    hora_cierre = serializers.TimeField()