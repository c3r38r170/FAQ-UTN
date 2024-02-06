import { PantallaNuevaPregunta} from '../pantallas/nueva-pregunta.js';

let pagina=PantallaNuevaPregunta(location.pathname,{usuario:window.usuarioActual});

// TODO Feature: logica de frontend y etiquetas.
// fetch('/api/etiquetas')