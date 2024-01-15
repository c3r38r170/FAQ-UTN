class Boton{
    #funcionClick;
    #titulo;
    constructor({
        funcionClick,
        titulo,

    }) {
        this.#funcionClick = funcionClick;
        this.#titulo = titulo;
      }

    render(){
        return`
        <button class="mi-boton" onclick="${this.#funcionClick}">
          ${
            this.#titulo
          }
        </button>
        `
    }

  

}

export {Boton};