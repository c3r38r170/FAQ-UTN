import { Pagina, Modal, Tabla, ComponenteLiteral, ChipUsuario } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(ruta, usuario) {
    let modal = new Modal('General', 'modal-general');
    let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
    let contenedor2 = new ComponenteLiteral(() => `</div>`)
    let tabla = new Tabla("posts-negativos", "/api/post/masNegativos", [
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
            nombre: "Valoración",
            clases: ["centrado"],
            celda: (post) =>
                post.valoracion
        },
    ]);

    return new Pagina({
        titulo: "Posts más Negativos",
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

export { crearPagina as PantallaEstadisticasPostsNegativos };