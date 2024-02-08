import { PaginaPerfilPropioRespuestas } from "../pantallas/perfil-propio-respuestas.js";

let pagina= PaginaPerfilPropioRespuestas(location.pathname, {usuario:window.usuarioActual});
pagina.partes[1]/* ! DesplazamientoInfinito */.pagina=2;