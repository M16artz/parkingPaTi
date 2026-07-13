export const LOJA_BOUNDS = [
  [-4.08, -79.277],
  [-3.895, -79.13],
];

export const LOJA_CENTER = [-3.9875, -79.2035];

export const LOJA_BBOX = [-79.277, -4.08, -79.13, -3.895];

export function estaEnLoja(latitud, longitud) {
  return (
    latitud >= LOJA_BOUNDS[0][0] &&
    latitud <= LOJA_BOUNDS[1][0] &&
    longitud >= LOJA_BOUNDS[0][1] &&
    longitud <= LOJA_BOUNDS[1][1]
  );
}
