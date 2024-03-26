import { Pagina, Modal, Tabla, ComponenteLiteral, ChipUsuario } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(ruta, usuario, query = "") {
    let modal = new Modal('General', 'modal-general');
    let votados = query == "?votados=0" ? 1 : 0;
    let mostrarFlecha = query == "?posts" || query == "/estadisticas/usuarios/masRelevantes" ? 0 : 1;
    let aviso = new ComponenteLiteral(() => '<label class="aviso">Apretando en las cabeceras puede cambiar la forma en la que se ordenan los usuarios</label>')
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
        {//<i class="fa-tipo fa-nombre mr-1"></i>
            nombre: `<a title='Filtrar por valoración' href='?votados=${votados}'>Puntuacion <i class='fa fa-arrow-${mostrarFlecha == 1 ? votados == 1 ? 'down' : 'up' : ""}'  aria-hidden='true'></i></a>`,
            clases: ["centrado"],
            celda: (post) =>
                post.valoracion ? post.valoracion : 0,
        },
    ], [], 1, false);

    return new Pagina({
        titulo: "Usuarios más relevantes",
        ruta: ruta,
        sesion: usuario,
        partes: [
            modal,
            aviso,
            contenedor1,
            tabla,
            contenedor2
        ]
    });
}

export { crearPagina as PantallaEstadisticasUsuariosMasRelevantes };