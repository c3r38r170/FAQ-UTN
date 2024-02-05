import { Pagina, Modal, DesplazamientoInfinito, Pregunta , ChipUsuario , Busqueda , Respuesta , Tabla, MensajeInterfaz, Titulo } from "../componentes/todos.js";
// import { EtiquetasPregunta as EtiquetasPreguntaDAO, Etiqueta as EtiquetaDAO, Pregunta as PreguntaDAO, SuscripcionesPregunta, Usuario as UsuarioDAO, Respuesta as RespuestaDAO, Post as PostDAO, ReportesUsuario as ReportesUsuarioDAO} from '../../../api/v1/model.js';


function crearPagina(usuario,queryString=''){
	let modal = new Modal('General','modal-general');
	return new Pagina({
		titulo: "Inicio",
		sesion:usuario,
		partes:[
			modal,
			new Busqueda('Hola')
			,new DesplazamientoInfinito(
				'inicio-preguntas'
				,'/api/pregunta'+queryString
				,p=>(new Pregunta(p,modal, usuario)).render()
			)
			
		]
	});
}

export {crearPagina as PaginaInicio};