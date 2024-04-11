import { PaginaPregunta } from '../pantallas/pregunta.js';
import { gEt, SqS } from "../libs/c3tools.js";
import { ComponenteLiteral, Formulario } from "../componentes/todos.js";

let pagina = PaginaPregunta(location.pathname, { usuario: window.usuarioActual }, window.pregunta);

let modal = pagina.partes[0];

let modalElemento = gEt("modal-general");
modalElemento.addEventListener("submit", () => {
    modalElemento.classList.remove("is-active");
});

var formulario = document.getElementById('nueva-respuesta');
var mensaje = document.createElement('div');
mensaje.className = 'mensaje-respuesta';
mensaje.textContent = 'Ten en cuenta que todos los usuarios de la plataforma podrán ver tu respuesta';
formulario.querySelector('textarea').insertAdjacentElement('beforebegin', mensaje);


let noBorrado = document.getElementById("botonBorrar");
if (noBorrado) {

    gEt("botonBorrar").onclick = (e) => {
        let boton = e.target;
        if (boton.type != "button") {
            return;
        }

        console.log(window.pregunta);

        var postID = boton.getAttribute("data-ID");
        modal.titulo = "Borrar Post";

        modal.contenido = [
            new ComponenteLiteral(
                () =>
                    `<p>¿Estás seguro que quieres borrar el post #${postID}?</p><br/>`
                    + `<p>${window.pregunta.titulo}</p>`
                    + `<p>${window.pregunta.post.cuerpo}</p><br/>`
            ),
            new Formulario('eliminadorPregunta' + postID, '/api/post/' + postID, [], (res) => { Swal.exito(res), location.reload() }, { textoEnviar: 'Eliminar', verbo: 'DELETE', clasesBoton: 'mx-auto is-danger w-100' })
        ];
        modal.redibujar();
        modalElemento.classList.add("is-active");

    };

}

let borrado = document.getElementById("botonRestaurar");
if (borrado) {

    gEt("botonRestaurar").onclick = (e) => {
        let boton = e.target;
        if (boton.type != "button") {
            return;
        }

        var postID = boton.getAttribute("data-ID");
        modal.titulo = "Restaurar Post";

        modal.contenido = [
            new ComponenteLiteral(
                () =>
                    `<p>Vas a restaurar el post #${postID}</p><br/>`
                    + `<p>${window.pregunta.titulo}</p>`
                    + `<p>${window.pregunta.post.cuerpo}</p><br/>`
            ),
            new Formulario('eliminadorPregunta' + postID, '/api/post/' + postID + '/restaurar', [], (res) => { Swal.exito(res), location.reload() }, { textoEnviar: 'Restaurar', verbo: 'PATCH', clasesBoton: 'mx-auto is-link w-100' })

        ];
        modal.redibujar();
        modalElemento.classList.add("is-active");

    };

}