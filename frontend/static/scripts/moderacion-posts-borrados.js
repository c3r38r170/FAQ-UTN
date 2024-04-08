import { PantallaModeracionPostsBorrados } from "../pantallas/moderacion-posts-borrados.js";
import { ComponenteLiteral } from "../componentes/todos.js";
import { gEt, SqS, createElement } from "../libs/c3tools.js";


let pagina = PantallaModeracionPostsBorrados(location.pathname, {
    usuario: window.usuarioActual,
});
let modal = pagina.partes[0];
let tabla = pagina.partes[2];
tabla.iniciar();


let modalElemento = gEt("modal-general");
modalElemento.addEventListener("submit", () => {
    modalElemento.classList.remove("is-active");
});


gEt('posts-borrados').onclick = (e) => {
    let t = e.target;
    console.log(e.target);
    if (t.type != "button") {
        return;
    }
    e.preventDefault();
    let postID = t.getAttribute('data-id');
    modal.titulo = "Restaurar Post";
    modal.contenido = [
        new ComponenteLiteral(
            () =>
                `<p class="has-text-centered">Vas a restaurar el post #${postID}</p><br/>`
        ),
        new Formulario('restaurarPost' + postID, '/api/post/' + postID + '/restaurar', [], (res) => { Swal.exito(res), location.reload() }, { textoEnviar: 'Restaurar', verbo: 'PATCH', clasesBoton: 'mx-auto is-link w-100' })

    ];
    modal.redibujar();
    modalElemento.classList.add("is-active");


}