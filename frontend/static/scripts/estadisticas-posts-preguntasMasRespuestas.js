import { PantallaEstadisticasPostsMasRespuestas } from "../pantallas/estadisticas-posts-preguntasMasRespuestas.js";

let pagina = PantallaEstadisticasPostsMasRespuestas(location.pathname, {
    usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
tabla.iniciar();