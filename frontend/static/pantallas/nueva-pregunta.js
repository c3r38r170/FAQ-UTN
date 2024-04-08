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
					{name:'titulo',textoEtiqueta:'Título',extra:'minlength="10" maxlength="250"'}
					// TODO UX: Detalles? ¿O Cuerpo? ¿O algo...? Ver algún ejemplo. Also, mostrar más grande (rows) y limitar texto (max?)
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea',extra:'minlength="10" maxlength="7000"'}
					// TODO Refactor: DRY en el extra de options? encontrar la forma de no repetir ese map largo... ¿quizá hacer Categorias.render?  Considerar todas las funciones, hay 2 sin valor predeterminado (nueva pregunta y busqueda sin hacer) y 2 con (busqueda hecha y editar pregunta)
					,{name:'etiquetasIDs',textoEtiqueta:'Etiquetas',type:'lista-etiquetas', extra:categorias.map(cat => cat.etiquetas.map(eti => `<option value=${eti.ID} data-color="${cat.color}" data-categoria="${cat.descripcion}">${cat.descripcion} - ${eti.descripcion}</option>`)).flat().join('')}
				]
				,(respuesta,info)=>{
					if(info.ok){
						respuesta=JSON.parse(respuesta);
						const preguntaID=+respuesta.ID
						const irAPregunta=()=>window.location.replace('/pregunta/'+preguntaID);
						if(respuesta.motivo){
							Swal.redirigirEn(10,`La pregunta se va a publicar, pero fue automáticamente reportada por el siguiente motivo:<br><br><i>${respuesta.motivo}</i>`)
								.then(irAPregunta);
						}else irAPregunta();
					}else Swal.error(`Error ${info.codigo}: ${respuesta}`);
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