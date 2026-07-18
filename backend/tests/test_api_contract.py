from django.urls import reverse


def test_api_requires_auth_with_uniform_error_envelope(client):
    response = client.get("/api/v1/cuentas/")

    assert response.status_code in {401, 403}
    assert set(response.json()) == {"error", "code", "detail", "fields"}


def test_openapi_schema_is_published(client):
    response = client.get(reverse("openapi-schema"), HTTP_ACCEPT="application/json")

    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "ParkingPaTi API"
    assert "/api/v1/tarifas/" in schema["paths"]
