class Etiqueta{
    #descripcion;
	#ID;
	#enlazar=true;
  #categoria;

	constructor({
    ID, descripcion, enlazar=true, categoria
  }){
    this.#ID = ID;
		this.#descripcion = descripcion;
		this.#enlazar = enlazar;
    this.#categoria = categoria;
	}
	render(){
    //  TODO Feature: Soporte para múltiples etiquetas al ir clickeandolas
		return`
      <a class="tag" style="background-color: ${this.#categoria.color}" ${this.#enlazar?`href="/?etiquetas=${this.#ID}"`:''}>${this.#descripcion}</a>
    `;
  }

}

export { Etiqueta };
