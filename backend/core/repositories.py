"""
Utilidades de repositorio compartidas entre apps (core/ porque no son
propiedad de ningun dominio especifico).
"""


def actualizar_generico(instancia, campos_permitidos=None, **datos):
    """
    Aplica `datos` sobre `instancia` y guarda.

    Antes este mismo bucle `for campo, valor in datos.items(): setattr(...)`
    estaba duplicado en 5 repositorios distintos (usuarios, parqueaderos,
    tarifas, horarios, documentos). Se centraliza aqui.

    `campos_permitidos`, si se indica, actua como whitelist adicional a
    nivel de repositorio (defensa en profundidad ante mass assignment,
    complementaria - no sustituta - de la validacion en el DTO/serializer).
    """
    for campo, valor in datos.items():
        if campos_permitidos is not None and campo not in campos_permitidos:
            continue
        setattr(instancia, campo, valor)
    instancia.save()
    return instancia
