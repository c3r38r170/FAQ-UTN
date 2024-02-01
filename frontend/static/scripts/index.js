import { PaginaInicio} from '../pantallas/todas.js';

let pagina=PaginaInicio('',window.usuarioActual,location.search);
pagina.partes[1].pagina=2;