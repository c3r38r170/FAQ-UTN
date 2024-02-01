import { Pagina, DesplazamientoInfinito, Pregunta , ChipUsuario , Busqueda , Respuesta , Tabla, MensajeInterfaz, Titulo } from "../componentes/todos.js";
// import { EtiquetasPregunta as EtiquetasPreguntaDAO, Etiqueta as EtiquetaDAO, Pregunta as PreguntaDAO, SuscripcionesPregunta, Usuario as UsuarioDAO, Respuesta as RespuestaDAO, Post as PostDAO, ReportesUsuario as ReportesUsuarioDAO} from '../../../api/v1/model.js';

function crearPagina(ruta,sesion,queryString){
	return new Pagina({
		ruta,
		titulo: "Inicio",
		sesion,
		partes:[
			new Busqueda('Hola')
			// ! Mandar los primeros resultados para el SEO.
			,new DesplazamientoInfinito(
				'inicio-preguntas'
				,'/api/pregunta'+queryString
				,p=>(new Pregunta(p)).render()
			)
		]
	});
}

export {crearPagina as PaginaInicio};