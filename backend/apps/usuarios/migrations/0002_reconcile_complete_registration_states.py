from django.db import migrations


def reconcile_complete_registration_states(apps, schema_editor):
    Cuenta = apps.get_model("usuarios", "Cuenta")
    Parqueadero = apps.get_model("parqueaderos", "Parqueadero")
    Documento = apps.get_model("documentos", "DocumentoHabilitacion")

    document_account_ids = Documento.objects.filter(estado="PENDIENTE").values_list(
        "cuenta_id", flat=True
    )
    complete_parking_ids = list(
        Parqueadero.objects.filter(
            propietario_id__in=document_account_ids,
            habilitacion_estado__in=["BORRADOR", "PENDIENTE"],
        ).values_list("propietario_id", flat=True)
    )
    if not complete_parking_ids:
        return

    Parqueadero.objects.filter(
        propietario_id__in=complete_parking_ids,
        habilitacion_estado="BORRADOR",
    ).update(habilitacion_estado="PENDIENTE", motivo_rechazo="")
    Cuenta.objects.filter(
        id__in=complete_parking_ids,
        correo_verificado=True,
        onboarding_estado__in=[
            "CORREO_PENDIENTE",
            "DATOS_INICIALES_PENDIENTES",
            "REVISION_PENDIENTE",
        ],
    ).update(onboarding_estado="REVISION_PENDIENTE")


class Migration(migrations.Migration):
    dependencies = [
        ("usuarios", "0001_initial"),
        ("parqueaderos", "0004_remove_parqueadero_parqueadero_habilit_f21c0b_idx_and_more"),
        ("documentos", "0003_alter_documentohabilitacion_drive_web_view_link"),
    ]

    operations = [
        migrations.RunPython(reconcile_complete_registration_states, migrations.RunPython.noop),
    ]
