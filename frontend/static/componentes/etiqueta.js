class Etiqueta {
  #descripcion;
  #ID;
  #categoria;
  constructor({ ID, descripcion, categoria }) {
    this.#descripcion = descripcion;
    this.#ID = ID;
    this.#categoria = categoria;
  }
  // ToDo Refactor: FALTA RUTA PARA VER ETIQUETAS
  render() {
    return `
        <a class="etiqueta" style="background-color: ${
          this.#categoria.color
        }" href="/etiqueta/${this.#ID}/preguntas"><div class="descripcion">${this.#descripcion}</div></a>
        `;
  }
}

export { Etiqueta };
