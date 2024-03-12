import { Pagina, Formulario} from "../componentes/todos.js";

// TODO refactor: Usar campo de Lista
function crearPagina(ruta,sesion,categorias){
	let pagina=new Pagina({
		ruta:ruta
		,titulo:'Nueva Pregunta'
		,sesion:sesion
		,partes:[
			new Formulario(
				'nueva-pregunta'
				,'/api/pregunta'
				,[
					{name:'titulo',textoEtiqueta:'Título'}
					// TODO UX: Detalles? ¿O Cuerpo? ¿O algo...? Ver algún ejemplo. Also, mostrar más grande (rows) y limitar texto (max?)
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea'}
					// TODO Refactor: DRY en el extra de options? encontrar la forma de no repetir ese map largo... ¿quizá hacer Categorias.render?  Considerar todas las funciones, hay 2 sin valor predeterminado (nueva pregunta y busqueda sin hacer) y 2 con (busqueda hecha y editar pregunta)
					,{name:'etiquetasIDs',textoEtiqueta:'Etiquetas',type:'lista-etiquetas', extra:categorias.map(cat => cat.etiquetas.map(eti => `<option value=${eti.ID} data-color="${cat.color}" data-categoria="${cat.descripcion}">${cat.descripcion} - ${eti.descripcion}</option>`)).flat().join('')}
				]
				,(respuesta,info)=>{
					if(info.ok){
						let preguntaID=+respuesta
						window.location.replace('/pregunta/'+preguntaID);
						// TODO UX: Mejores alertas.
					}else alert(`Error ${info.codigo}: ${respuesta}`);
				}
				,{
					textoEnviar:'Crear Pregunta', clasesBoton:'is-link is-rounded mt-3'
				}
			)
			// TODO UX: Que se bloquee el formulario al enviar, si hay un error salta cartel (como por moderación), si no lleva a la página de la pregunta.
		]
	});
	return pagina;
}

export {crearPagina as PantallaNuevaPregunta};