import { Pagina, Modal, Tabla, ComponenteLiteral, ChipUsuario } from "../componentes/todos.js";

// TODO Now: Agregar etiquetas
function crearPagina(ruta, usuario) {
    let modal = new Modal('General', 'modal-general');
    let contenedor1 = new ComponenteLiteral(() => `<div class="contenedor-tabla">`)
    let contenedor2 = new ComponenteLiteral(() => `</div>`)
    let tabla = new Tabla("estadisticas-sitio", "/api/post/estadisticas", [
        {
            nombre: "Estadística",
            celda: (stat) =>
                stat.nombre
        },
        {
            nombre: "Valor",
            clases: ["centrado"],
            celda: (stat) =>
                stat.valor
        },
        {
            nombre: "En el último mes",
            clases: ["centrado"],
            celda: (stat) =>
                stat.ultimoMes
        },
    ]);

    return new Pagina({
        titulo: "Estadísticas del Sitio",
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

export { crearPagina as PantallaEstadisticasSitio };