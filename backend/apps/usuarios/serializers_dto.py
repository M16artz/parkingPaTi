from rest_framework import serializers
from .models import Persona, Cuenta

class PersonaDTO(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = [
            'id', 
            'nombre', 
            'apellido', 
            'tipo_identificacion', 
            'identificacion', 
            'estado'
        ]


class CuentaLecturaDTO(serializers.ModelSerializer):
    persona = PersonaDTO(read_only=True)

    class Meta:
        model = Cuenta
        fields = [
            'id', 
            'username', 
            'rol', 
            'estado',
            'correo',
            'persona'
        ]
        read_only_fields = fields


class CuentaEscrituraDTO(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = [
            'username', 
            'password', 
            'rol', 
            'estado',
            'correo',
            'persona'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        cuenta = super().create(validated_data)
        
        if password:
            cuenta.set_password(password)
            cuenta.save()
            
        return cuenta