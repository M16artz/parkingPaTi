from rest_framework import serializers
from .models import Parqueadero, Espacio

# --- DTOs para Parqueadero ---

class ParqueaderoConductorDTO(serializers.ModelSerializer):
    """
    Serializer resumido para el conductor (solo lectura).
    No expone datos administrativos como 'aprobado', 'activo' o el 'propietario'.
    """
    class Meta:
        model = Parqueadero
        fields = [
            'id', 
            'nombre', 
            'descripcion', 
            'calle_principal', 
            'calle_secundaria', 
            'referencia', 
            'latitud', 
            'longitud'
        ]
        read_only_fields = fields


class ParqueaderoPropietarioDTO(serializers.ModelSerializer):
    """
    Serializer completo para operaciones CRUD del propietario y administrador.
    """
    class Meta:
        model = Parqueadero
        fields = [
            'id',
            'propietario',
            'nombre',
            'descripcion',
            'calle_principal',
            'calle_secundaria',
            'referencia',
            'latitud',
            'longitud',
            'aprobado',
            'activo',
            'fecha_registro'
        ]
        # Para Admins
        read_only_fields = ['id', 'aprobado', 'fecha_registro']


# --- DTOs para Espacio ---

class EspacioDTO(serializers.ModelSerializer):
    """
    Serializer para la entidad Espacio.
    Maneja el código y el estado (LIBRE, OCUPADO, INHABILITADO).
    """
    class Meta:
        model = Espacio
        fields = [
            'id',
            'parqueadero',
            'codigo',
            'estado'
        ]