// TODO Refactor: Añadir consistencia a los nombres de los archivos de los componentes. la mayoria son elnombretodojunto, este y botonReporte son camelCase, pero yo preferiría usar-guiones

class MensajeInterfaz {
  static GRIS=1;
  static PRINCIPAL=2;
  static ADVERTENCIA=3;
  static PELIGRO=4;
  static INFORMACION=5;

    #tipo='';
    #mensaje='';
    #cerrable=false;
    constructor(clave, mensaje,cerrable=false) {
      // TODO Refactor: Considerar usar un Enum (const TipoMensajeInterfaz={ADVERTENCIA:3,PELIGRO:4...})
      this.#tipo = {
          '1': '',
          '2': 'is-primary',
          '3': 'is-warning',
          '4': 'is-danger',
          '5': 'is-info',
        }[clave];
      this.#mensaje = mensaje;
      this.#cerrable=cerrable;
    }

    render() {
    // TODO Feature: Hacerlos cerrables o no cerrables.
      return `
        <div class='notification is-light ${this.#tipo} m-4'>
            ${this.#cerrable?'<button class="delete"></button>':''}
            ${this.#mensaje}
        </div>
      `;
    }
  }
  
export {MensajeInterfaz};
