import { PaginaPerfilPropioRespuestas } from "../pantallas/perfil-propio-respuestas.js";

// TODO UX: No traer votos de la respuesta.
let pagina= PaginaPerfilPropioRespuestas(location.pathname, {usuario:window.usuarioActual});
pagina.partes[1]/* ! DesplazamientoInfinito */.pagina=2;