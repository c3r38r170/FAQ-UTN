import { PaginaInicio} from '../pantallas/todas.js';

let pagina=PaginaInicio({usuario:window.usuarioActual},location.search);
pagina.partes[2]/* ! DesplazamientoInfinito */.pagina=2;