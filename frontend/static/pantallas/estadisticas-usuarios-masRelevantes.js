import { Pagina, Modal, Tabla, ComponenteLiteral, ChipUsuario } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(ruta, usuario, query = "") {
    let modal = new Modal('General', 'modal-general');
    let votados = query == "?votados=0" ? 1 : 0;
    console.log(query)
    let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
    let contenedor2 = new ComponenteLiteral(() => `</div>`)
    let tabla = new Tabla("usuarios-mas-relevantes", "/api/usuario/masRelevantes" + query, [
        {
            nombre: "Pregunta",
            celda: (post) =>
                new ChipUsuario(post.duenio).render()
        },
        {
            nombre: "<a title='Filtrar por cantidad de posts' href='?posts'>Cantidad de Posts</a>",
            clases: ["centrado"],
            celda: (post) =>
                post.cantPosts ? post.cantPosts : 0,
        },
        {
            nombre: "<a title='Filtrar por valoración' href='?votados=" + votados + "'>Puntuacion</a>",
            clases: ["centrado"],
            celda: (post) =>
                post.valoracion ? post.valoracion : 0,
        },
    ]);

    return new Pagina({
        titulo: "Usuarios más relevantes",
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

export { crearPagina as PantallaEstadisticasUsuariosMasRelevantes };