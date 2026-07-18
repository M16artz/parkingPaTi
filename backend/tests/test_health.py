import pytest
from django.urls import reverse


@pytest.mark.parametrize("method", ["get"])
def test_health_returns_ok_without_external_services(client, method):
    response = getattr(client, method)(reverse("health"))

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_rejects_non_get_methods(client):
    response = client.post(reverse("health"))

    assert response.status_code == 405
