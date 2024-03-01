import { PantallaModeracionPosts } from "../pantallas/moderacion-posts.js";
import { gEt, SqS, createElement } from "../libs/c3tools.js";
import { ComponenteLiteral, DesplazamientoInfinito, Formulario, Pregunta } from '../componentes/todos.js';

let pagina = PantallaModeracionPosts(location.pathname, {
  usuario: window.usuarioActual
});

let tabla = pagina.partes[0];
tabla /* ! Tabla */
  .iniciar();
let modal = pagina.partes[1];

gEt('moderar-posts').onclick=(e)=>{
  let t=e.target;

  if(t.classList.contains('button')){
    e.preventDefault();

    let fieldset=t.parentNode;

    let extraerReportadoID=(rep)=>rep.reportado.respuestaID||rep.reportado.preguntaID;
    let reporteIndice=tabla.entidades.findIndex(rep=>extraerReportadoID(rep)==t.value);
    let reporte=tabla.entidades[reporteIndice];
    let reportado=reporte.reportado;
    let reportadoID=extraerReportadoID(reporte);
    let esRespuesta=!!reporte.reportado.respuestaID;
    let nombreEntidad=esRespuesta?'respuesta':'pregunta';

    function quitarReporte(){
      if (extraerReportadoID(tabla.entidades[reporteIndice]) == reportadoID) {
        if(tabla.pagina==1){
          SqS(`tbody tr:nth-child(${reporteIndice+1})`).remove();
        }else{
          SqS('footer [value="-1"]').click();
          // !caso esquina de eliminar uno que esté solo en la última página
          if(tabla.entidades.length!=1)
            SqS('footer [value="1"]').click();
        }
      }
    }

    function alEnviar(){
      fieldset.disabled=true
      modal.cerrar();
    }

    if(t.classList.contains('eliminar')){
      modal.titulo=`¿Está seguro que desea eliminar esta ${nombreEntidad}?`;
      modal.contenido=[
        new ComponenteLiteral(()=>`<a class="is-block has-text-centered" href="/pregunta/${reportado.preguntaID}" target="_blank"><b>"${reportado.cuerpo}"</b></a>`),
        new Formulario(
          "moderacion-posts-eliminar",
          `/api/post/${reportadoID}`,
          [],
          (txt, info) => {
            if (info.ok) {
              quitarReporte()
            } else {
              fieldset.disabled = false;
              // TODO UX: Mejores alertas
              alert(`Error ${info.codigo}: ${txt}`);
            }
          },
          {
            verbo: "DELETE",
            textoEnviar: "Eliminar "+nombreEntidad,
            clasesBoton: "is-danger is-rounded mt-3",
            alEnviar
          }
        )
      ];
    }

    if(t.classList.contains('unificar')){
      modal.titulo=`Unificar la pregunta "${reportado.cuerpo}".`;
      modal.contenido=[
        // TODO Refactor: Estaría bueno usar Búsqueda... o eliminarlo
        new Formulario(
          'moderacion-preguntas-unificar'
          ,`/api/pregunta/${reportadoID}`
          ,[
            {
              name: "unificar-busqueda",
              textoEtiqueta: "Buscar preguntas",
              value:reportado.cuerpo
            }
          ]
          // TODO Refactor: DRY
          ,(txt,info)=>{
            if(info.ok){
              quitarReporte();
            } else {
              fieldset.disabled = false;
              // TODO UX: Mejores alertas
              alert(`Error ${info.codigo}: ${txt}`);
            }
          },{
            verbo:'PATCH'
            ,textoEnviar: 'Unificar'
            ,clasesBoton:'is-link is-rounded mt-3'
            ,alEnviar
          }
        )
      ];

      let endpointInicial='/api/pregunta/?formatoCorto&searchInput='+reportado.cuerpo;
      fetch(endpointInicial)
        .then(res=>res.json())
        .then(preguntas=>{
          let intentarAgregarLasPreguntas=()=>{
            let campoBusqueda=SqS('[name="unificar-busqueda"]')
            if(!campoBusqueda){
              setTimeout(intentarAgregarLasPreguntas,100);
              return;
            }

            let divFantasma=createElement('DIV');
            campoBusqueda.parentNode/* * `label` */.after(divFantasma);
            divFantasma.outerHTML=new DesplazamientoInfinito('moderacion-pregunta-unificar-desplinf',endpointInicial/* * Se actualiza */,(pre)=>{
              let pregunta=new Pregunta(pre).render();
              return `<div class="moderacion-preguntas-unificar-desplinf-pregunta"> ${pregunta} <input type="radio" name="duplicadoID"> </div>`
            },preguntas).render()
          }
          intentarAgregarLasPreguntas();
        })
      /* fetch() preguntas, añadir al formulario */
    }

    modal.redibujar();
    modal.abrir();
  }
}

var nBusqueda=0;

gEt('moderacion-posts-modal').onchange=(e)=>{
  let t=e.target;

  if(t.name=='unificar-busqueda'){
    let nEstaBusqueda=++nBusqueda;
    setTimeout(()=>{
      if(nEstaBusqueda==nBusqueda){
        DesplazamientoInfinito.instancias['moderacion-pregunta-unificar-desplinf'].reiniciar('/api/pregunta/?formatoCorto&searchInput='+t.value);
      }
    },400)
  }
}