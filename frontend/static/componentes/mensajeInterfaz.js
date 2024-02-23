// TODO Refactor: Añadir consistencia a los nombres de los archivos de los componentes. la mayoria son elnombretodojunto, este y botonReporte son camelCase, pero yo preferiría usar-guiones

class MensajeInterfaz {
    #tipo;
    #mensaje;
    constructor(clave, mensaje) {

      // TODO Refactor: Considerar usar un Enum (const TipoMensajeInterfaz={ADVERTENCIA:3,PELIGRO:4...})
      this.#tipo = {
          '1': '',
          '2': 'is-primary',
          '3': 'is-warning',
          '4': 'is-danger',
        }[clave];
        this.#mensaje = mensaje;
    }

    render() {
    // TODO Feature: Hacerlos cerrables o no cerrables.
      return `
        <div class='notification is-light ${this.#tipo} m-4'>
            <button class="delete"></button>
            ${this.#mensaje}
        </div>
      `;
    }
  }
  
export {MensajeInterfaz};
