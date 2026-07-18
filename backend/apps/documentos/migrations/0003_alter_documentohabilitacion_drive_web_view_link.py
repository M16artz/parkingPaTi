from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("documentos", "0002_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="documentohabilitacion",
            name="drive_web_view_link",
            field=models.URLField(blank=True, default="", max_length=500),
        ),
    ]
