import { Pagina, Titulo, Formulario, Tabla, Fecha, ChipUsuario, Modal, Respuesta, Pregunta, ComponenteLiteral, Busqueda } from '../componentes/todos.js'

function crearPantalla(ruta, sesion, query = "") {
	let tabla = new Tabla('moderar-posts', '/api/post/reporte?searchInput=' + query, [
		{
			nombre: 'Post'
			, celda: ({ reportado }) => [
				new ChipUsuario(reportado.duenio)
				, new ComponenteLiteral(() => `<span class="pregunta">${reportado.respuestaID ? 'Respuesta a ' : ''}<a target="_blank" href="/pregunta/${reportado.preguntaID}" class="titulo">${reportado.titulo}</a></span>`
					+ `<div class="cuerpo">${reportado.cuerpo}</div>`)
			].reduce((acc, el) => acc + el.render(), '')
			, clases: ['preguntas-o-respuestas']
		}
		, {
			nombre: 'Reportes'
			, celda: (rep) => `Última fecha: <b>${new Fecha(rep.fecha, Fecha.CORTA).render()}</b>Cantidad: <b>${rep.cantidad}</b>`
			, clases: ['centrado']
		}
		, {
			nombre: 'Acciones'
			, celda: (rep) => {
				let html = ''
					, tipos = rep.tiposIDs.split(',')
					// ,reportadoID=rep.reportado.respuestaID||rep.reportado.preguntaID
					// TODO Refactor: Expandir boton.js para que sea util en este caso.
					, crearBoton = (claseColor, clasePropia, texto) => `<fieldset><button class="button ${claseColor} ${clasePropia}" value="${rep.reportado.respuestaID || rep.reportado.preguntaID}">${texto}</button></fieldset>`;

				// TODO Refactor: Estaría bueno poder comparar números... pero bueno, depende de que el endpoint devuelva números en vez de letras.
				if (tipos.includes('1')) {
					html += crearBoton('is-danger', 'eliminar', 'Eliminar');
				}
				if (tipos.includes('2')) {
					html += crearBoton('is-link', 'unificar', 'Unificar');
				}

				return html;
			}
			, clases: ['botones', 'centrado']
		}
	]);
	let contenedor1 = new ComponenteLiteral(()=> `<div class="contenedor-tabla">`)
	let contenedor2 = new ComponenteLiteral(()=> `</div>`)
	let pagina = new Pagina({
		ruta: ruta,
		titulo: 'Moderación - Preguntas y Respuestas Reportadas',
		sesion,
		partes: [
			new Busqueda(),
			contenedor1,
			tabla,
			contenedor2
			, new Modal('Moderar preguntas y respuestas', 'moderacion-posts-modal') // * El título se va cambiando.
		]
	});
	return pagina;
}

export { crearPantalla as PantallaModeracionPosts };