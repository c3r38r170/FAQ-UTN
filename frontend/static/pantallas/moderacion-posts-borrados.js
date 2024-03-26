import { Pagina, Titulo, Formulario, Tabla, Fecha, ChipUsuario, Modal, Respuesta, Pregunta, ComponenteLiteral, Busqueda, Boton } from '../componentes/todos.js'

function crearPantalla(ruta, usuario, query = "") {
	let usp = new URLSearchParams(query);
	if (query == "") {
		query = "?searchInput=";
	}
    let modal = new Modal('General', 'modal-general');
    let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
    let contenedor2 = new ComponenteLiteral(() => `</div>`)
    let tabla = new Tabla("posts-borrados", "/api/post/borrados", [
        {
            nombre: "Post",
            celda: (post) =>
                [
                    new ChipUsuario(post.duenio).render()
                    + new ComponenteLiteral(() => `<span class="pregunta">${post.respuesta ? 'Respuesta a <a target="_blank" href="/pregunta/' + post.respuesta.pregunta.ID + '" class="titulo">' + post.respuesta.pregunta.titulo + '</a></span>' : '<a target="_blank" href="/pregunta/' + post.pregunta.ID + '" class="titulo">' + post.pregunta.titulo + '</a></span>'}`
                        + `<div class="cuerpo">${post.cuerpo}</div>`).render()
                ]
            , clases: ['preguntas-o-respuestas']
        },
        {
            nombre: "Acción",
            clases: ["centrado"],
            celda: (post) => [
                `<button id="botonRestaurar${post.ID}" data-ID="${post.ID}" type="button" class="button is-link is-small is-rounded">Restaurar</button>`
            ]
        },
    ]);

    return new Pagina({
        titulo: "Posts borrados",
        ruta: ruta,
        sesion: usuario,
        partes: [
            modal,
            contenedor1,
            tabla,
            contenedor2
        ]
    });
}

export { crearPantalla as PantallaModeracionPostsBorrados };