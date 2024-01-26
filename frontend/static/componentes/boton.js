class Boton{
    #onClick;
    #titulo;
    #dataTarget;
    #type;
    #classes;
    constructor({
        onClick,
        titulo,
        classes,
        dataTarget,
        type,

    }) {
        this.#onClick = onClick;
        this.#titulo = titulo;
        this.#dataTarget = dataTarget;
        this.#type = type;
        this.#classes = classes;
      }

    render(){
        return `
        <button class="${this.#classes}" data-target="${this.#dataTarget}" onclick="${this.#onClick}">
          ${
            this.#titulo
          }
        </button>
        `
    }

  

}

export {Boton};