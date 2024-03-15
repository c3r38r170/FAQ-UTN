import { MensajeInterfaz } from '../componentes/mensajeInterfaz.js';
import { SqS } from '../libs/c3tools.js';
import { PaginaPerfil } from "../pantallas/perfil.js";

let pagina = PaginaPerfil(location.pathname, { usuario: window.usuarioActual }, { DNI: location.pathname.split('/')[2] });
let desplinf=pagina.partes[2];
if(!SqS('.pregunta')){
	desplinf.opcionesMensajeFinal=[
		MensajeInterfaz.INFORMACION
		// ,'Este usuario todavía no ha publicado nada.'
		,'No hay contenido para mostrar.'
	];
}
desplinf.pagina=2;