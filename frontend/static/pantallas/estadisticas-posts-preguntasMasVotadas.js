import { Pagina, Modal, Tabla, ComponenteLiteral, ChipUsuario } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(ruta, usuario) {
    let modal = new Modal('General', 'modal-general');
    let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
    let contenedor2 = new ComponenteLiteral(() => `</div>`)
    let tabla = new Tabla("preguntas-mas-votadas", "/api/pregunta/masVotadas", [
        {
            nombre: "Pregunta",
            celda: (pregunta) => [
                new ChipUsuario(pregunta.post.duenio),
                new ComponenteLiteral(() => `<span class="pregunta"><a target="_blank" href="/pregunta/${pregunta.post.ID}" class="titulo">${pregunta.titulo}</a></span>`
                    + `<div class="cuerpo">${pregunta.post.cuerpo}</div>`)].reduce((acc, el) => acc + el.render(), '')
            , clases: ['preguntas']
        },
        {
            nombre: "Valoración",
            clases: ["centrado"],
            celda: (pregunta) =>
                pregunta.valoracion,
        },
    ]);

    return new Pagina({
        titulo: "Preguntas mejor Calificadas",
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

export { crearPagina as PantallaEstadisticasPostsMasVotados };