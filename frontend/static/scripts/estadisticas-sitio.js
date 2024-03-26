import { PantallaEstadisticasSitio } from "../pantallas/estadisticas-sitio.js";

let pagina = PantallaEstadisticasSitio(location.pathname, {
    usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
console.log(tabla)
tabla.iniciar();