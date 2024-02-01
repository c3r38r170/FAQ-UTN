class MensajeInterfaz {
    #tipo;
    #mensaje;
    constructor(clave, mensaje) {

      this.#tipo = {
          '1': '',
          '2': 'is-primary',
          '3': 'is-warning',
          '4': 'is-danger',
        }[clave];
        this.#mensaje = mensaje;
    }

    render() {
      return `
        <div class='notification is-light ${this.#tipo} mx-4'>
            <button class="delete"></button>
            ${this.#mensaje}
        </div>
      `;
    }
  }
  
export {MensajeInterfaz};
