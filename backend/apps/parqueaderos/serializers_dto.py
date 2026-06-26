from rest_framework import serializers
from .models import Parqueadero, Direccion, Ubicacion, Espacio

class DireccionDTO(serializers.ModelSerializer):
    class Meta:
        model = Direccion
        fields = ['calle_principal', 'calle_secundaria', 'numero_lote']


class UbicacionDTO(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = ['latitud', 'longitud']


class EspacioDTO(serializers.ModelSerializer):
    class Meta:
        model = Espacio
        fields = ['id', 'parqueadero', 'numero_espacio', 'estado']


class ParqueaderoConductorDTO(serializers.ModelSerializer):
    direccion = DireccionDTO(read_only=True)
    ubicacion = UbicacionDTO(read_only=True)

    class Meta:
        model = Parqueadero
        fields = [
            'id', 
            'nombre', 
            'tarifa', 
            'disponibilidad', 
            'direccion', 
            'ubicacion'
        ]
        read_only_fields = fields


class ParqueaderoPropietarioDTO(serializers.ModelSerializer):
    direccion = DireccionDTO(required=False)
    ubicacion = UbicacionDTO(required=False)

    class Meta:
        model = Parqueadero
        fields = [
            'id',
            'propietario',
            'nombre',
            'estado',
            'validado',
            'tarifa',
            'disponibilidad',
            'direccion',
            'ubicacion'
        ]
        read_only_fields = ['id', 'validado']

    def create(self, validated_data):
        direccion_data = validated_data.pop('direccion', None)
        ubicacion_data = validated_data.pop('ubicacion', None)
        
        parqueadero = Parqueadero.objects.create(**validated_data)
        
        if direccion_data:
            Direccion.objects.create(parqueadero=parqueadero, **direccion_data)
        if ubicacion_data:
            Ubicacion.objects.create(parqueadero=parqueadero, **ubicacion_data)
            
        return parqueadero

    def update(self, instance, validated_data):
        direccion_data = validated_data.pop('direccion', None)
        ubicacion_data = validated_data.pop('ubicacion', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if direccion_data:
            Direccion.objects.update_or_create(parqueadero=instance, defaults=direccion_data)
        if ubicacion_data:
            Ubicacion.objects.update_or_create(parqueadero=instance, defaults=ubicacion_data)

        return instance