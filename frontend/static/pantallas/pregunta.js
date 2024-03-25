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
                {name:'cuerpo',textoEtiqueta:'Tu respuesta:',type:'textarea'},
                {name:'IDPregunta', textoEtiqueta:'idPregunta', type:'hidden', value:pregunta.ID}
            ]
            ,(respuesta,{ok,codigo})=>{
                if(ok)
                    window.location.reload();
                else{
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