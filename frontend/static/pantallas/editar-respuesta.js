import { Pagina, Formulario, Pregunta, Modal } from "../componentes/todos.js";

function crearPagina(ruta, sesion, respuesta) {
	let pagina = new Pagina({
		ruta: ruta
		, titulo: 'Editando Respuesta'
		, sesion: sesion
		, partes: [
			new Modal(),
			new Formulario(
				'editando-respuesta'
				, '/api/respuesta/'
				, [
					{ name: 'ID', textoEtiqueta: 'ID', value: respuesta.ID, type: 'hidden' },
					// TODO Refactor: ¿Por qué respuesta.pregunta puede no tener ID?? No tiene sentido según el dominio.
					// TODO Refactor: Also, en algún punto de la vida, quizá meter los endpoints de respuestas en los de preguntas. Ejemplo: POST /api/pregunta/:ID/respuesta
					{ name: 'IDPregunta', textoEtiqueta: 'ID', value: respuesta.pregunta?.ID, type: 'hidden' }
					, { name: 'cuerpo', textoEtiqueta: 'Respuesta', type: 'textarea', value: respuesta.cuerpo }
				]
				, (res,{ok,codigo}) => {
					// TODO Refactor: DRY en esto al editar o crear pregunta o respuesta.
					if(ok){
						// ! No se puede acceder a las variables de alrededor.
						respuesta=JSON.parse(res);
						const preguntaID=+respuesta.ID
						const recargar=()=>window.location.replace('/pregunta/'+preguntaID);
						// TODO Refactor: trim??
						if(respuesta.motivo){
							Swal.redirigirEn(10,`La edición se va a publicar, pero fue automáticamente reportada por el siguiente motivo:<br><br><i>${respuesta.motivo}</i>`)
								.then(recargar);
						}else recargar();
					}else{
						Swal.error(`Error ${codigo}: ${res}`);
					}
				}
				, {
					textoEnviar: 'Editar Respuesta', verbo: 'PATCH', clasesBoton: 'is-link is-rounded mt-3'
				}
			)
		]
	});
	return pagina;
}

export { crearPagina as PantallaEditarRespuesta };