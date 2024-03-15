import { MensajeInterfaz } from '../componentes/mensajeInterfaz.js';
import { SqS } from '../libs/c3tools.js';
import { PaginaPerfilPropioPreguntas } from "../pantallas/perfil-propio-preguntas.js";

let pagina= PaginaPerfilPropioPreguntas(location.pathname, {usuario:window.usuarioActual});
let desplinf=pagina.partes[1];
if(!SqS('.pregunta')){
	desplinf.opcionesMensajeFinal=[
		MensajeInterfaz.INFORMACION
		,'No hay preguntas para mostrar.'
	];
}
desplinf.pagina=2;


