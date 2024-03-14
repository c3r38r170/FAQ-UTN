import { PantallaEditarPregunta } from '../pantallas/editar-pregunta.js';
import inicializarListas from './inicializar-listas.js';

let pagina = PantallaEditarPregunta(location.pathname, { usuario: window.usuarioActual }, [], []);
inicializarListas();