import { PaginaPerfilPropioPreguntas } from "../pantallas/perfil-propio-preguntas.js";

let pagina= PaginaPerfilPropioPreguntas(location.pathname, {usuario:window.usuarioActual});
pagina.partes[1]/* ! DesplazamientoInfinito */.pagina=2;


