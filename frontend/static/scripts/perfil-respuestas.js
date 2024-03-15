import { MensajeInterfaz } from '../componentes/mensajeInterfaz.js';
import { SqS } from '../libs/c3tools.js';
import { PaginaPerfilPropioRespuestas } from "../pantallas/perfil-propio-respuestas.js";

let pagina= PaginaPerfilPropioRespuestas(location.pathname, {usuario:window.usuarioActual});
let desplinf=pagina.partes[1];
if(!SqS('.pregunta')){
	desplinf.opcionesMensajeFinal=[
		MensajeInterfaz.INFORMACION
		,'No hay respuestas para mostrar.'
	];
}
desplinf.pagina=2;