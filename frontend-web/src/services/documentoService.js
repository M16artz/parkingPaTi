// src/services/documentoService.js
//
// El registro también recoge `archivoDocumento` (un File), pero
// DocumentoViewSet vive en /api/documentos/ y exige multipart/form-data
// con el campo "archivo" (no "archivoDocumento") - ver
// apps/documentos/serializers_dto.py::DocumentoEscrituraDTO. Debe llamarse
// aparte, autenticado, después de crear la cuenta.

import { apiClient } from './apiClient';

export const documentoService = {
  /**
   * POST /api/documentos/  (multipart/form-data)
   * @param {File} archivo
   * @param {string} [fechaExpiracion] formato YYYY-MM-DD
   */
  async subir(archivo, fechaExpiracion) {
    const form = new FormData();
    form.append('archivo', archivo);
    if (fechaExpiracion) form.append('fecha_expiracion', fechaExpiracion);

    const { data } = await apiClient.post('/documentos/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // DocumentoLecturaDTO
  },
};
