import { PantallaModeracionPosts } from "../pantallas/moderacion-posts.js";
import { gEt, SqS } from "../libs/c3tools.js";
import { ComponenteLiteral } from '../componentes/componenteliteral.js';

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

    let extraerReportadoID=(rep)=>rep.reportado.respuestaID||rep.reportado.preguntaID;
    let reporteIndice=tabla.entidades.findIndex(rep=>extraerReportadoID(rep)==t.value);
    let reporte=tabla.entidades[reporteIndice];
    let reportadoID=extraerReportadoID(reporte);
    let esRespuesta=!!reporte.reportado.respuestaID;
    let nombreEntidad=esRespuesta?'respuesta':'pregunta';

    if(t.classList.contains('eliminar')){
      modal.titulo=`¿Está seguro que desea eliminar esta ${nombreEntidad}?`;
      modal.contenido=[
        new Formulario(
          "moderacion-posts-eliminar",
          `/api/post/${reportadoID}`,
          [],
          (txt, info) => {
            if (info.ok) {
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
            } else {
              t.disabled = false;
              // TODO UX: Mejores alertas
              alert(`Error ${info.codigo}: ${txt}`);
            }
          },
          {
            verbo: "DELETE",
            textoEnviar: "Eliminar "+nombreEntidad,
            clasesBoton: "is-danger is-rounded mt-3",
            alEnviar: () =>{
              t.disabled=true
              modal.cerrar();
            }
          }
        )
      ];
    }

    if(t.classList.contains('unificar')){
      modal.titulo='unificando';
      modal.contenido=[new ComponenteLiteral(()=>'Unificar?')];
    }

    modal.redibujar();
    modal.abrir();
  }
}