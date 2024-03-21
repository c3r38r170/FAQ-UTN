import { Pagina, Modal, Tabla, ComponenteLiteral } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(ruta, usuario) {
    let modal = new Modal('General', 'modal-general');
    let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
    let contenedor2 = new ComponenteLiteral(() => `</div>`)
    let tabla = new Tabla("etiquetas-usadas", "/api/etiqueta/masUsadas", [
        {
            nombre: "Etiqueta",
            celda: (etiqueta) =>
                etiqueta.etiquetum.descripcion,
        },
        {
            nombre: "Categoría",
            clases: ["centrado"],
            celda: (etiqueta) =>
                `<div class="categoria" style="background-color: ${etiqueta.etiquetum.categoria.color}"><div class="descripcion">${etiqueta.etiquetum.categoria.descripcion}</div></div>`
        },
        {
            nombre: "Incidencias",
            clases: ["centrado"],
            celda: (etiqueta) =>
                etiqueta.cantidad,
        },
    ]);

    return new Pagina({
        titulo: "Etiquetas más Usadas",
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

export { crearPagina as PantallaEstadisticasPosts };