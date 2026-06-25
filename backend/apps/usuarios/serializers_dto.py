from rest_framework import serializers
from .models import Persona, Cuenta

class PersonaDTO(serializers.ModelSerializer):
    """
    Serializer para operaciones CRUD de la entidad Persona.
    """
    class Meta:
        model = Persona
        fields = [
            'id', 
            'nombres', 
            'apellidos', 
            'tipo_identificacion', 
            'identificacion', 
            'telefono', 
            'email'
        ]


class CuentaLecturaDTO(serializers.ModelSerializer):
    """
    Serializer para lectura de Cuenta.
    Expone la información de la cuenta y anida los datos completos de la Persona.
    """
    persona = PersonaDTO(read_only=True)

    class Meta:
        model = Cuenta
        fields = [
            'id', 
            'username', 
            'rol', 
            'activo', 
            'persona'
        ]
        read_only_fields = fields


class CuentaEscrituraDTO(serializers.ModelSerializer):
    """
    Serializer para creación y actualización de Cuentas.
    Protege la contraseña configurándola como solo escritura (write_only).
    """
    class Meta:
        model = Cuenta
        fields = [
            'username', 
            'password', 
            'rol', 
            'activo', 
            'persona'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Sobrescribe el método de creación para asegurar el hashing de la contraseña.
        """
        password = validated_data.pop('password', None)
        # Se crea la instancia de la cuenta sin la contraseña
        cuenta = super().create(validated_data)
        
        # Se aplica el hash a la contraseña usando el método nativo de AbstractUser
        if password:
            cuenta.set_password(password)
            cuenta.save()
            
        return cuenta