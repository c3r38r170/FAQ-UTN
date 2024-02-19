import { PaginaSuscripciones } from "../pantallas/suscripciones.js";

let pagina= PaginaSuscripciones(location.pathname, {usuario:window.usuarioActual});
pagina.partes[1]/* ! DesplazamientoInfinito */.pagina=2;