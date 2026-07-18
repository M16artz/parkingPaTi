from django.core.management.base import BaseCommand

from apps.estancias.services import EstanciaService


class Command(BaseCommand):
    help = "Elimina fisicamente estancias finalizadas/canceladas con mas de 12 meses."

    def handle(self, *args, **options):
        eliminadas = EstanciaService.eliminar_vencidas()
        self.stdout.write(self.style.SUCCESS(f"Estancias eliminadas: {eliminadas}"))
