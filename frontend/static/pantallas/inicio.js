import { Pagina, Modal, DesplazamientoInfinito, Pregunta , ChipUsuario , Busqueda , Respuesta , Tabla, MensajeInterfaz, Titulo } from "../componentes/todos.js";
// import { EtiquetasPregunta as EtiquetasPreguntaDAO, Etiqueta as EtiquetaDAO, Pregunta as PreguntaDAO, SuscripcionesPregunta, Usuario as UsuarioDAO, Respuesta as RespuestaDAO, Post as PostDAO, ReportesUsuario as ReportesUsuarioDAO} from '../../../api/v1/model.js';


function crearPagina(sesion,queryString=''){
	let modal = new Modal('General','modal-general');
	return new Pagina({
		titulo: "Inicio",
		sesion,
		partes:[
			modal,
			new Busqueda('Hola')
			// ! Mandar los primeros resultados para el SEO.
			,new DesplazamientoInfinito(
				'inicio-preguntas'
				,'/api/pregunta'+queryString
				,p=>(new Pregunta(p,modal)).render()
			)
			
		]
	});
}

export {crearPagina as PaginaInicio};