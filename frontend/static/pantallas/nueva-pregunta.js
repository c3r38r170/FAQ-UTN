import { Pagina, Formulario, ComponenteLiteral } from "../componentes/todos.js";


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
			// ,new ComponenteLiteral(()=>'<label class=label>Sugerencias basadas en el título:</label>')
			// TODO Feature: Formulario de creación de preguntas 
			// ✅ Campo de Título. Tiene que sugerir preguntar relacionadas. 
			// ✅ Campo de etiquetas. Se deben obtener las etiquetas, mostrarlas, permitir elegirlas.
			// ✅ Campo de cuerpo. Texto largo con un máximo y ya.
			// Las sugerencias pueden ser un panel abajo, o abajo del título... que se vaya actualizando a medida que se escribe el cuerpo.
			// Botón de crear pregunta. Se bloquea, si hay un error salta cartel (como por moderación), si no lleva a la página de la pregunta. Reemplaza, así volver para atrás va al inicio y no a la creación de preguntas.
		]
	});
	return pagina;
}

export {crearPagina as PantallaNuevaPregunta};