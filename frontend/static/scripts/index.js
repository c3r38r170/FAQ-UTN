import { PaginaInicio} from '../pantallas/todas.js';
import inicializarListas from './inicializar-listas.js';

let pagina=PaginaInicio({usuario:window.usuarioActual},location.search);
pagina.partes[2]/* ! DesplazamientoInfinito */.pagina=2;
inicializarListas();