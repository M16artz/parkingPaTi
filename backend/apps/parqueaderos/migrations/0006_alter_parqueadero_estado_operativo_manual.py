from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("parqueaderos", "0005_parqueadero_estado_operativo_manual"),
    ]

    operations = [
        migrations.AlterField(
            model_name="parqueadero",
            name="estado_operativo_manual",
            field=models.CharField(
                blank=True,
                choices=[
                    ("ABIERTO", "Abierto"),
                    ("CERRADO", "Cerrado"),
                    ("FUERA_DE_SERVICIO", "Fuera de servicio"),
                ],
                max_length=30,
                null=True,
            ),
        ),
    ]
