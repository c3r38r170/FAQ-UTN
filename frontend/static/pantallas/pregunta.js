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
        ,respuestaID=>{
            // TODO Feature: ¿o solo agregar la respuesta??
            window.location.replace(ruta);
        }
        ,{
            textoEnviar:'Publicar Respuesta', clasesBoton:'is-link is-rounded mt-3'
        }
    )
    pagina.partes.push(form)
}

    return pagina;
}

export {PaginaPregunta};