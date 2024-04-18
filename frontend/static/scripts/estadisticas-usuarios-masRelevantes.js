import { PantallaEstadisticasUsuariosMasRelevantes } from "../pantallas/estadisticas-usuarios-masRelevantes.js";

let pagina = PantallaEstadisticasUsuariosMasRelevantes(location.pathname, {
    usuario: window.usuarioActual,
}, location.search);
let modal = pagina.partes[0];
let tabla = pagina.partes[3];
tabla.iniciar();