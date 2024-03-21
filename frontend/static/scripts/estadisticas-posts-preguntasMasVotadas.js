import { PantallaEstadisticasPostsMasVotados } from "../pantallas/estadisticas-posts-preguntasMasVotadas.js";

let pagina = PantallaEstadisticasPostsMasVotados(location.pathname, {
    usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
tabla.iniciar();