import { Pagina, Modal, DesplazamientoInfinito, Pregunta , Busqueda } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(usuario,queryString='',categoriasConEtiquetas=[]){
	let modal = new Modal('General','modal-general');
	let usp=new URLSearchParams(queryString);

	return new Pagina({
		titulo: "Inicio",
		sesion:usuario,
		partes:[
			modal,
			new Busqueda({valorBusqueda:usp.get('searchInput'),categorias: categoriasConEtiquetas,etiquetasSeleccionadas:usp.getAll('etiquetas')})
			,new DesplazamientoInfinito(
				'inicio-preguntas'
				,'/api/pregunta'+queryString
				,p=>(new Pregunta(p,modal, usuario)).render()
			)
			
		]
	});
}

export {crearPagina as PaginaInicio};