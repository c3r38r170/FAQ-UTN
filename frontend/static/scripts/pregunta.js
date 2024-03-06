import { PantallaNuevaPregunta} from '../pantallas/nueva-pregunta.js';

let pagina=PantallaNuevaPregunta(location.pathname,{usuario:window.usuarioActual},[]);
import inicializarListas from './inicializar-listas.js';

inicializarListas();