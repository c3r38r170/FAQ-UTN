class Titulo {
    #titulo;
    #elemento;
    #tipo
    constructor(clave, titulo) {

      this.#tipo = {
          '1': 'is-1',
          '2': 'is-2',
          '3': 'is-3',
          '4': 'is-4',
          '5': 'is-5'
        }[clave];

        this.#elemento = {
            '1': 'h1',
            '2': 'h2',
            '3': 'h3',
            '4': 'h4',
            '5': 'h5'
          }[clave];

        this.#titulo = titulo;
    }

    render() {
      return `
        <${this.#elemento} class='title ${this.#tipo}'>
           ${this.#titulo}
        </${this.#elemento}>
      `;
    }
  }
  
export {Titulo};
