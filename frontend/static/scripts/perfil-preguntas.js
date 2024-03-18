import { PaginaPerfilPropioPreguntas } from "../pantallas/perfil-propio-preguntas.js";

let pagina= PaginaPerfilPropioPreguntas(location.pathname, {usuario:window.usuarioActual});
let desplinf=pagina.partes[1];
desplinf.pagina=2;


