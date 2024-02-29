class Etiqueta{
    #descripcion;
	#ID;
	#enlazar=true;
  #categoria;

	constructor({
    ID, descripcion, enlazar, categoria
  }){
    this.#ID = ID;
		this.#descripcion = descripcion;
		this.#enlazar = enlazar;
    this.#categoria = categoria;
	}
	render(){
		return`
      <a class="tag" style="background-color: ${this.#categoria.color}" ${this.#enlazar?`href="/etiqueta/${this.#ID}/preguntas"`:''}>${this.#descripcion}</a>
    `;
  }

}

export { Etiqueta };
