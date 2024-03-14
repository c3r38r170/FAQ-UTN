class Boton {
  #onClick;
  // TODO Refactor: ¿Cambiar a texto? No es un "título" en sí...
  #titulo;
  #dataTarget; // * para abrir modal tiene que tener el mismo dataTarget que el id del modal en html
  #type; // * submit, por ejemplo
  #classes; // * cadena de texto
  #id;
  
  constructor({ onClick, titulo, classes, dataTarget, type, id = "" }) {
    this.#titulo = titulo;
    this.#onClick = onClick;
    this.#dataTarget = dataTarget;
    this.#type = type;
    this.#classes = classes;
    this.#id = id;
  }

  render() {
    // TODO Refactor: Considerar los casos en que type sea undefined, ver si onClick realmente se usa, ver el resto de los parámetros.
    let atributos=`class="button is-link ${this.#classes} is-rounded"`;
    if(this.#dataTarget){
      atributos += ` data-target="${this.#dataTarget}"`;
    }
    if(this.#onClick){
      atributos += ` onclick="${this.#onClick}"`;
    }
    if(this.#id){
      atributos += ` id="${this.#id}"`;
    }
    if(this.#type){
      atributos += ` type="${this.#type}"`;
    }
    return this.#type=='submit'?
      `<input ${atributos} value=${this.#titulo}>`
      :`<button ${atributos}>${this.#titulo}</button>`;
  }
}

export { Boton };
