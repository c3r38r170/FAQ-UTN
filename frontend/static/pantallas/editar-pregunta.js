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
					{name:'ID',textoEtiqueta:'ID',value:pregunta.ID, clasesLabel: 'noMostrar'}
					,{name:'titulo',textoEtiqueta:'Título',value:pregunta.titulo}
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea',value:pregunta.cuerpo}
				]
				,(res)=>{
					setTimeout(function() {
						window.location.reload();
					  }, 1000);
					
				}
				,{
					textoEnviar:'Editar Pregunta', verbo: 'PATCH', clasesBoton:'is-link is-rounded mt-3'
				}
			)
		]
	});
	return pagina;
}

export {crearPagina as PantallaEditarPregunta};