import { Pagina, Formulario, Pregunta } from "../componentes/todos.js";

function crearPagina(ruta,sesion, respuesta, categorias){
	let pagina=new Pagina({
		ruta:ruta
		,titulo:'Editando Respuesta'
		,sesion:sesion
		,partes:[
            new Pregunta(respuesta.pregunta),
			new Formulario(
				'editando-respuesta'
				,'/api/respuesta'
				,[
					{name:'ID',textoEtiqueta:'ID',value:respuesta.ID, type:'hidden'}
					,{name:'cuerpo',textoEtiqueta:'Respuesta',type:'textarea',value:respuesta.cuerpo}
                ]
				,(res)=>{
					console.log(res)
					setTimeout(function() {
                        // TODO refactor: redirigir a pregunta asociada a esa respuesta
						window.location.replace('/pregunta/'+res);
						}, 1000);
					
				}
				,{
					textoEnviar:'Editar Respuesta', verbo: 'PATCH', clasesBoton:'is-link is-rounded mt-3'
				}
			)
		]
	});
	return pagina;
}

export {crearPagina as PantallaEditarRespuesta};