import { Pagina, Formulario } from "../componentes/todos.js";

function crearPagina(ruta,sesion, pregunta){
	let pagina=new Pagina({
		ruta:ruta
		,titulo:'Editando Pregunta'
		,sesion:sesion
		,partes:[
			new Formulario(
				'editando-pregunta'
				,'/api/pregunta'
				,[
					{name:'titulo',textoEtiqueta:'Título',value:pregunta.titulo}
					// TODO UX: Detalles? ¿O Cuerpo? ¿O algo...? Ver algún ejemplo. Also, mostrar más grande (rows) y limitar texto (max?)
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea',value:pregunta.cuerpo}
				]
				,(respuesta,info)=>{
					if(info.ok){
						let preguntaID=+respuesta
						window.location.replace('/pregunta/'+preguntaID);
						// TODO UX: Mejores alertas.
					}else alert(`Error ${info.codigo}: ${respuesta}`);
				}
				,{
					textoEnviar:'Editar Pregunta', verbo: 'patch', clasesBoton:'is-link is-rounded mt-3'
				}
			)
			// TODO Feature: Formulario de creación de preguntas 
			// Campo de Título. Tiene que sugerir preguntar relacionadas. 
			// ✅ Campo de etiquetas. Se deben obtener las etiquetas, mostrarlas, permitir elegirlas.
			// ✅ Campo de cuerpo. Texto largo con un máximo y ya.
			// Las sugerencias pueden ser un panel abajo, o abajo del título... que se vaya actualizando a medida que se escribe el cuerpo.
			// Botón de crear pregunta. Se bloquea, si hay un error salta cartel (como por moderación), si no lleva a la página de la pregunta. Reemplaza, así volver para atrás va al inicio y no a la creación de preguntas.
		]
	});
	return pagina;
}

export {crearPagina as PantallaEditarPregunta};