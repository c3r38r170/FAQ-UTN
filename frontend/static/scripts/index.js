import { PaginaInicio} from '../pantallas/todas.js';
import inicializarListas from './inicializar-listas.js';

let pagina=PaginaInicio({usuario:window.usuarioActual},location.search);
let desplinf=pagina.partes[2];
desplinf.pagina=2;
inicializarListas();