import { PantallaEstadisticasPostsRelevantes } from "../pantallas/estadisticas-posts-preguntasRelevantes.js";

let pagina = PantallaEstadisticasPostsRelevantes(location.pathname, {
    usuario: window.usuarioActual,
}, location.search);
let modal = pagina.partes[0];
let tabla = pagina.partes[3];
console.log(tabla)
tabla.iniciar();