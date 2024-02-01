import { PaginaInicio} from '../pantallas/todas.js';

let pagina=PaginaInicio(window.usuarioActual,location.search);
pagina.partes[2]/* ! DesplazamientoInfinito */.pagina=2;