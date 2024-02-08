import { Modal } from "../componentes/modal.js";
import { Pagina } from "../componentes/pagina.js";
import { Formulario } from "../componentes/formulario.js";

function PaginaPregunta(ruta, sesion, idPregunta){
    let pagina = new Pagina({
        ruta: ruta,
        titulo: '',
        sesion: sesion,
        idPregunta: idPregunta,
    });


    let modal = new Modal('General','modal-general');
    pagina.partes.push(modal);
    if(sesion.usuario ===undefined){}
    else{
    let form = new Formulario(
        'nueva-respuesta'
        ,'/api/respuesta'
        ,[
            // TODO UX: Detalles? ¿O Cuerpo? ¿O algo...? Ver algún ejemplo.
            {name:'cuerpo',textoEtiqueta:'Detalles',type:'textarea'},
            {name:'idPregunta', textoEtiqueta:'idPregunta', type:'hidden', value:idPregunta}
        ]
        ,respuestaID=>{
            window.location.replace(ruta);
        }
        ,{
            textoEnviar:'Crear Respuesta', clasesBoton:'is-link is-rounded mt-3'
        }
    )
    pagina.partes.push(form)
}
    /*pagina.partes.push(
    // TODO Feature: Diferenciar de la implementación en / así allá aparece la primera respuesta y acá no.
    new Pregunta(p, modal)
                // TODO Feature: Considerar traer directamente todas las respuestas, en vez de paginarlas.
            // DesplazamientoInfinito de respuestas; sin fin de mensaje
    //,...p.respuestas.map(r=>new Respuesta(r))
                // Formulario de respuesta
    );*/
    return pagina;
}

export {PaginaPregunta};