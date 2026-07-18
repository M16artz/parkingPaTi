from django.db import migrations, models


def sincronizar_email(apps, schema_editor):
    Cuenta = apps.get_model("usuarios", "Cuenta")
    Cuenta.objects.exclude(email=models.F("correo")).update(email=models.F("correo"))


class Migration(migrations.Migration):
    dependencies = [
        ("usuarios", "0002_reconcile_complete_registration_states"),
    ]

    operations = [
        migrations.RunPython(sincronizar_email, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="cuenta",
            constraint=models.CheckConstraint(
                condition=models.Q(email=models.F("correo")),
                name="cuenta_email_igual_correo",
            ),
        ),
    ]
