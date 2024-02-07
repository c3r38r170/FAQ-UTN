import { Pagina, Modal, DesplazamientoInfinito, Pregunta , Busqueda } from "../componentes/todos.js";

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