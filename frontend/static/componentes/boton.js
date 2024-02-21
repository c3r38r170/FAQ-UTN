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
      // TODO Refactor: Considerar los casos en que type sea undefined, ver si onClick realmente se usa, ver el resto de los parámetros.
        return `
        <button class="${this.#classes} is-rounded" data-target="${this.#dataTarget}" onclick="${this.#onClick}" type="${this.#type}">
          ${
            this.#titulo
          }
        </button>
        `
    }

  

}

export {Boton};