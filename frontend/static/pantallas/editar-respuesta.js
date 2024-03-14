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
					{ name: 'IDPregunta', textoEtiqueta: 'ID', value: respuesta.pregunta?.ID, type: 'hidden' }
					, { name: 'cuerpo', textoEtiqueta: 'Respuesta', type: 'textarea', value: respuesta.cuerpo }
				]
				, (res) => {
					console.log(res)
					setTimeout(function () {
						// TODO refactor: redirigir a pregunta asociada a esa respuesta
						window.location.replace('/pregunta/' + res);
					}, 1000);

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