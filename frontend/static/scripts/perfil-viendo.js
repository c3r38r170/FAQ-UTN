import { PaginaPerfil } from "../pantallas/perfil.js";
import { gEt, SqS } from "../libs/c3tools.js";
import { ComponenteLiteral, Formulario } from "../componentes/todos.js";


let pagina = PaginaPerfil(location.pathname, { usuario: window.usuarioActual }, { DNI: location.pathname.split('/')[2] });
let desplinf = pagina.partes[4];
desplinf.pagina = 2;

let modal = pagina.partes[0];

let modalElemento = gEt("modal-general");
modalElemento.addEventListener("submit", () => {
    modalElemento.classList.remove("is-active");
});


let bloqueado = document.getElementById("botonDesbloquear");
if (bloqueado) {

    gEt("botonDesbloquear").onclick = (e) => {
        let boton = e.target;
        if (boton.type != "button") {
            return;
        }

        var usuarioDNI = boton.getAttribute("data-DNI");
        let endpoint = "/api/usuario?searchInput=" + usuarioDNI;
        let usuarioEncontrado = null;
        fetch(endpoint, {
            credentials: 'include',
            method: 'GET'
        })
            .then(res => {
                res.json()
                    .then((usuarios) => {

                        for (let user of usuarios) {
                            if (usuarioDNI === user.DNI) {
                                usuarioEncontrado = user;
                                break;
                            }
                        }

                        modal.titulo = "Desbloquear Usuario";

                        modal.contenido = [
                            new ComponenteLiteral(
                                () =>
                                    `<big><b><p>¿Estás seguro?</p></b></big> <p><i>${usuarioEncontrado.nombre} fue bloqueado con el siguiente motivo:</i><br/>${usuarioEncontrado.bloqueosRecibidos[0].motivo}</p><br/>`
                            ),
                            new Formulario(
                                "moderacion-usuario-desbloquear",
                                `/api/usuario/${usuarioDNI}/bloqueo`,
                                [
                                    {
                                        name: "motivo",
                                        textoEtiqueta: "Motivo del desbloqueo:",
                                        type: "textarea",
                                    },
                                ],
                                () => {
                                    location.reload()
                                },
                                {
                                    verbo: "DELETE",
                                    textoEnviar: "Registrar motivo y desbloquear",
                                    clasesBoton: "is-link is-rounded mt-3",
                                    // alEnviar: () => (checkbox.disabled = true),
                                }
                            ),
                        ];


                        modal.redibujar();


                        modalElemento.classList.add("is-active");



                    }).catch(error => {
                        console.log('Error con  usuario:', error);
                    })
                    // TODO Feature: catch
                    .finally(() => {
                    })
            })


    };

}

let desbloqueado = document.getElementById("botonBloquear");
if (desbloqueado) {

    gEt("botonBloquear").onclick = (e) => {
        let boton = e.target;
        if (boton.type != "button") {
            return;
        }

        var usuarioDNI = boton.getAttribute("data-DNI");
        let endpoint = "/api/usuario?searchInput=" + usuarioDNI;
        let usuarioEncontrado = null;
        fetch(endpoint, {
            credentials: 'include',
            method: 'GET'
        })
            .then(res => {
                res.json()
                    .then((usuarios) => {

                        for (let user of usuarios) {
                            if (usuarioDNI === user.DNI) {
                                usuarioEncontrado = user;
                                break;
                            }
                        }

                        modal.titulo = "Bloquear Usuario";

                        modal.contenido = [
                            new Formulario(
                                "moderacion-usuario-bloquear",
                                `/api/usuario/${usuarioDNI}/bloqueo`,
                                [
                                    {
                                        name: "motivo",
                                        textoEtiqueta: "Motivo del bloqueo:",
                                        type: "textarea",
                                    },
                                ],
                                () => {
                                    location.reload()
                                },
                                {
                                    verbo: "POST",
                                    textoEnviar: "Registrar motivo y bloquear",
                                    clasesBoton: "is-link is-rounded mt-3",
                                    // alEnviar: () => (checkbox.disabled = true),
                                }
                            ),
                        ];

                        modal.redibujar();


                        modalElemento.classList.add("is-active");



                    }).catch(error => {
                        console.log('Error con  usuario:', error);
                    })
                    // TODO Feature: catch
                    .finally(() => {
                    })
            })

    }

}
