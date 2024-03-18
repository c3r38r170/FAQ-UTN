import { PaginaPerfilPropioRespuestas } from "../pantallas/perfil-propio-respuestas.js";

let pagina= PaginaPerfilPropioRespuestas(location.pathname, {usuario:window.usuarioActual});
let desplinf=pagina.partes[1];
desplinf.pagina=2;