import { PantallaEstadisticasPostsNegativos } from "../pantallas/estadisticas-posts-postsNegativos.js";

let pagina = PantallaEstadisticasPostsNegativos(location.pathname, {
    usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
tabla.iniciar();