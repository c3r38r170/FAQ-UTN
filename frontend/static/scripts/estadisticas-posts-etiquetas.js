import { PantallaEstadisticasPosts } from "../pantallas/estadisticas-posts-etiquetas.js";

let pagina = PantallaEstadisticasPosts(location.pathname, {
    usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
tabla.iniciar();