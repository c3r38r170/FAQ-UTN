import { ChipUsuario } from "./chipusuario.js";
import { ChipValoracion } from "./chipvaloracion.js";
import { Fecha } from "./fecha.js";
import { BotonReporte } from "./botonReporte.js";
import { Desplegable } from "./desplegable.js";
import { Formulario } from "./formulario.js"

class Respuesta {
  #ID;
  #valoracion = null;
  #cuerpo = '';
  #fecha = null;
  #duenio = null;
  #usuarioActual = null;
  #instanciaModal = null;
  #chipValoracion = null;
  #desplegable;
  constructor({ ID, cuerpo, fecha, post }, instanciaModal, usuario) {
    this.#ID = ID;
    this.#cuerpo = cuerpo;
    this.#fecha = new Fecha(fecha);
    this.#duenio = post.duenio;
    this.#instanciaModal = instanciaModal;
    this.#usuarioActual = usuario;

    if ((post.votos && usuario && this.#usuarioActual) || !usuario && post.votos) {
      this.#chipValoracion = new ChipValoracion({
        ID
        , votos: post.votos
        , usuarioActual: usuario
        , duenio: post.duenio
      });
    }

    if (this.#usuarioActual) {
      this.#desplegable = new Desplegable('opcionesRespuesta' + this.#ID, '<i class="fa-solid fa-ellipsis fa-lg"></i>', undefined, undefined, 'opcionesPost');
      if (this.#usuarioActual && this.#usuarioActual.DNI == this.#duenio.DNI) {
        let form = new Formulario(
          'eliminadorRespuesta' + this.#ID
          , '/api/post/' + this.#ID
          , []
          , (txt, { ok, codigo }) => {
            if (!ok) {
              Swal.error(txt);
              return;
            }

            // * A diferencia de las preguntas, nunca van a necesitar reemplazarse con un cartel.
            SqS(`.respuesta[data-post-id="${txt}"]`).remove();
          }
          , {
            textoEnviar: 'Eliminar'
            , verbo: 'DELETE'
            , clasesBoton: 'mx-auto is-danger w-100'
            , alEnviar: (e) => {
              e.preventDefault();
              return new Promise((resolve, reject) => {
                Swal.confirmar('¿Seguro que desea eliminar esta respuesta? Esto no se puede deshacer.')
                  .then(res => {
                    if (res.isConfirmed) {
                      resolve();
                      // TODO Refactor: Esto de acá abajo genera un error?? Quizá porque nunca se catchea... "Uncaught (in promise) undefined"
                    } else reject();
                  })
              });
            }
          }
        ).render();
        let opciones = [
          {
            descripcion: "Editar",
            tipo: "link",
            href: "/respuesta/" + this.#ID + "/editar",
          },
          {
            tipo: "form",
            render: form
          },
        ];
        this.#desplegable.opciones = opciones;
      } else {
        // {name,textoEtiqueta,type,required=true,value=''/* TODO Refactor: null? */,extra,placeholder, clasesInput}){
        let form = new Formulario(
          'reportadorPost' + this.#ID,
          '/api/post/' + this.#ID + '/reporte',
          [{
            name: "tipoID",
            textoEtiqueta: "Lenguaje Vulgar",
            value: '1',
            type: "radio"
          }],
          (res) => { Swal.exito(`${res}`) },
          { textoEnviar: 'Reportar', verbo: 'POST', clasesBoton: 'mx-auto is-link w-100' }
        ).render()
        let opciones = [
          {
            tipo: "form",
            render: form
          }
        ];
        this.#desplegable.opciones = opciones;
      }
    } else {
      this.#desplegable = undefined;
    }



  }


  // ${(this.#instanciaModal && this.#usuarioActual && this.#duenio.DNI != this.#usuarioActual.DNI)? '<div class="contenedor-reporte">'+new BotonReporte(this.#ID, this.#instanciaModal).render()+'</div>':''}

  render() {
    return `
        <div class="respuesta" data-post-id="${this.#ID}">
              ${this.#chipValoracion ? this.#chipValoracion.render() : ''}
              <div class="cuerpo">
                ${this.#usuarioActual ? '<div class="contenedor-reporte">' + this.#desplegable.render() + '</div>' : ''}
                ${this.#cuerpo.replace(/\n/g, '<br>')}
                <div class="usuario">
                    ${new ChipUsuario(this.#duenio).render()}
                    ${this.#fecha.render()}
                </div>
            </div>
        </div>
        `;
  }


}

export { Respuesta };
