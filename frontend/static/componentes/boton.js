class Boton{
    #onClick;
    #titulo;
    #dataTarget; // para abrir modal tiene que tener el mismo dataTarget que el id del modal en html
    #type; //submit
    #classes; // cadena de texto
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
        <button class="${this.#classes}" data-target="${this.#dataTarget}" onclick="${this.#onClick}" type="${this.#type}">
          ${
            this.#titulo
          }
        </button>
        `
    }

  

}

export {Boton};