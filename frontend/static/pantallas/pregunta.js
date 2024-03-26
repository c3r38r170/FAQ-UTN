import { Pregunta, Modal, Pagina, Formulario, ComponenteLiteral, MensajeInterfaz} from "../componentes/todos.js"

function PaginaPregunta(ruta, sesion, pregunta){
    
    let pagina = new Pagina({
        ruta: ruta,
        titulo: '',
        sesion: sesion,
    });

    let modal = new Modal('General','modal-general');
    
    let posibleMensajePostBloqueado;
    let posibleBotonModerar;
    if(sesion.usuario && sesion.usuario.perfil.permiso.ID > 1){
        let boton;
        if(pregunta.post.eliminadorDNI){
            boton = `<button id="botonRestaurar" data-ID="${pregunta.ID}" type="button" class="button is-warning is-light is-small is-rounded is-outlined">Restaurar Post</button>`
            posibleMensajePostBloqueado = new MensajeInterfaz(MensajeInterfaz.GRIS,'<i class="fa-solid fa-ban mr-2"></i> Este Post se encuentra borrado')
        }else{
            boton = `<button id="botonBorrar" data-ID="${pregunta.ID}" type="button" class="button is-warning is-small is-rounded">Borrar Post</button>`
            posibleMensajePostBloqueado = new ComponenteLiteral(()=> ``)
        }
        posibleBotonModerar = new ComponenteLiteral(()=> `<div class="contenedor-boton-bloqueo">${boton}</div> `)
    }else{
        posibleMensajePostBloqueado = new ComponenteLiteral(()=> ``)
        posibleBotonModerar = new ComponenteLiteral(()=> ``)
    };

    // pregunta.titulo = "";
    pagina.partes.push(
        modal,
        posibleMensajePostBloqueado,
        posibleBotonModerar,
        new Pregunta(pregunta, modal, sesion.usuario)
        );

    if(sesion && sesion.usuario){
        let form = new Formulario(
            'nueva-respuesta'
            ,'/api/respuesta'
            ,[
                // TODO Feature: Parámetro de máximo tamaño de post? Es tanto acá en respuesta como en detalles de pregunta
                {name:'cuerpo',textoEtiqueta:'Tu respuesta:',type:'textarea', extra:'maxlength="7000"'},
                {name:'IDPregunta', textoEtiqueta:'idPregunta', type:'hidden', value:pregunta.ID}
            ]
            ,(respuesta,{ok,codigo})=>{
                if(ok){
                    const reload=()=>window.location.reload();
                    if(respuesta.motivo){
                        Swal.redirigirEn(10,`La pregunta se va a publicar, pero fue automáticamente reportada por el siguiente motivo:<br><br><i>${respuesta.motivo}</i>`)
                            .then(reload);
                    }else reload();
                }else{
                    Swal.error(`Error ${codigo}: ${respuesta}`);
                }
            }
            ,{
                textoEnviar:'Publicar Respuesta'
                , clasesBoton:'is-link is-rounded mt-3'
                // ,alEnviar:()=>document.getElementById()
            }
        )
        pagina.partes.push(
            form
            )
    }

    return pagina;
}

export {PaginaPregunta};