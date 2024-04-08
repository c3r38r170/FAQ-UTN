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
					// TODO Refactor: Mandar patch a /pregunta/:ID, no ?ID=
					{name:'ID',textoEtiqueta:'ID',value:pregunta.ID, type:'hidden'}
					,{name:'titulo',textoEtiqueta:'Título',value:pregunta.titulo}
					,{name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea',value:pregunta.cuerpo}
					// TODO refactor: llevar el map a Formulario y mandar extra: categorias
					,{name:'etiquetas',textoEtiqueta:'Etiquetas',type:'lista-etiquetas',value:pregunta.etiquetas , extra:categorias.map(cat => cat.etiquetas.map(eti => `<option value=${eti.ID} data-color="${cat.color}" data-categoria="${cat.descripcion}" ${pregunta.etiquetas.some(({etiquetum: {ID}})=>ID==eti.ID) ? 'selected' : ''}>${cat.descripcion} - ${eti.descripcion}</option>`)).flat().join('')}
				]
				,(res)=>{
					const recargar=()=>window.location.replace('/pregunta/'+pregunta.ID);
					// TODO Refactor: trim??
					if(res){
						Swal.redirigirEn(10,`La edición se va a publicar, pero fue automáticamente reportada por el siguiente motivo:<br><br><i>${res}</i>`)
							.then(recargar);
					}else recargar();
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