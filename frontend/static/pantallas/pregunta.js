import { Modal } from "../componentes/modal.js";
import { Pagina } from "../componentes/pagina.js";
import { Formulario } from "../componentes/formulario.js";

function PaginaPregunta(ruta, sesion, idPregunta){
    
    let pagina = new Pagina({
        ruta: ruta,
        titulo: '',
        sesion: sesion,
    });

    let modal = new Modal('General','modal-general');
    pagina.partes.push(modal);
    if(sesion && sesion.usuario){
        let form = new Formulario(
            'nueva-respuesta'
            ,'/api/respuesta'
            ,[
                {name:'cuerpo',textoEtiqueta:'Tu respuesta:',type:'textarea'},
                {name:'IDPregunta', textoEtiqueta:'idPregunta', type:'hidden', value:idPregunta}
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
        pagina.partes.push(form)
    }

    return pagina;
}

export {PaginaPregunta};