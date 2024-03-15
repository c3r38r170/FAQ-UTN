import { MensajeInterfaz } from '../componentes/mensajeInterfaz.js';
import { SqS } from '../libs/c3tools.js';
import { PaginaInicio} from '../pantallas/todas.js';
import inicializarListas from './inicializar-listas.js';

let pagina=PaginaInicio({usuario:window.usuarioActual},location.search);
let desplinf=pagina.partes[2];
if(!SqS('.pregunta')){
	desplinf.opcionesMensajeFinal=[
		MensajeInterfaz.INFORMACION
		,'No se encontraron resultados.'
	];
}
desplinf.pagina=2;
inicializarListas();