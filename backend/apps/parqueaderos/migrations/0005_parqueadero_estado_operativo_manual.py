from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("parqueaderos", "0004_remove_parqueadero_parqueadero_habilit_f21c0b_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="parqueadero",
            name="estado_operativo_manual",
            field=models.CharField(
                blank=True,
                choices=[
                    ("CERRADO", "Cerrado"),
                    ("FUERA_DE_SERVICIO", "Fuera de servicio"),
                ],
                max_length=30,
                null=True,
            ),
        ),
    ]
