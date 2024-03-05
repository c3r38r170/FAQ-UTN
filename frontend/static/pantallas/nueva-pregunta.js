import { Pagina, Formulario } from "../componentes/todos.js";


// TODO refactor: Usar campo de Lista
function crearPagina(ruta,sesion){
	let pagina=new Pagina({
		ruta:ruta
		,titulo:'Nueva Pregunta'
		,sesion:sesion
		,partes:[
			new Formulario(
				'nueva-pregunta'
				,'/api/pregunta'
				,[
					/* {name,textoEtiqueta,type,required=true,value,extra,clasesBoton} */
					{name:'titulo',textoEtiqueta:'Título'}
					// TODO UX: Detalles? ¿O Cuerpo? ¿O algo...? Ver algún ejemplo. Also, mostrar más grande (rows) y limitar texto (max?)
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea'}
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

export {crearPagina as PantallaNuevaPregunta};