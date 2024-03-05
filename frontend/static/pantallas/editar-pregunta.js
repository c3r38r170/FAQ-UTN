import { Pagina, Formulario, ListaEtiquetas } from "../componentes/todos.js";

function crearPagina(ruta,sesion, pregunta, categorias){
	let pagina=new Pagina({
		ruta:ruta
		,titulo:'Editando Pregunta'
		,sesion:sesion
		,partes:[
			new Formulario(
				'editando-pregunta'
				,'/api/pregunta'
				,[
					{name:'ID',textoEtiqueta:'ID',value:pregunta.ID, type:'hidden'}
					,{name:'titulo',textoEtiqueta:'Título',value:pregunta.titulo}
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea',value:pregunta.cuerpo}
					,{name:'etiquetas',textoEtiqueta:'Etiquetas',type:'lista-etiquetas',value:pregunta.etiquetas , extra:categorias.map(cat => cat.etiquetas.map(eti => `<option value=${eti.ID} data-color="${cat.color}" data-categoria="${cat.descripcion}" ${pregunta.etiquetas.some(({etiquetum: {ID}})=>ID==eti.ID) ? 'selected' : ''}>${cat.descripcion} - ${eti.descripcion}</option>`)).flat().join('')}
				]
				,(res)=>{
					setTimeout(function() {
						window.location.reload();
					  }, 1000);
					
				}
				,{
					textoEnviar:'Editar Pregunta', verbo: 'PATCH', clasesBoton:'is-link is-rounded mt-3'
				}
			),
			// new ListaEtiquetas('editando-pregunta')

		]
	});
	return pagina;
}

export {crearPagina as PantallaEditarPregunta};
// for(let eti of cat.etiquetas){
// 	optionsEtiquetas.push(['OPTION',{
// 		value:eti.ID
// 		,dataset:{
// 			categoriaID:cat.ID
// 		}
// 		,innerText:`${cat.descripcion} - ${eti.descripcion}`
// 	}]);

// 	htmlStyle+=`, .tag.is-rounded[data-value="${eti.ID}"]`;
// }