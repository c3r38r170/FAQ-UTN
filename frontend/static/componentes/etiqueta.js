class Etiqueta{
    #descripcion;
	#ID;
	#enlazar=true;

	constructor({
        ID, descripcion, enlazar
    }){
		this.#descripcion = descripcion;
		this.#ID = ID;
		this.#enlazar = enlazar;
	}
	
	render(){
		return`
        <a class="tag" ${this.#enlazar?`href="/etiqueta/${this.#ID}/preguntas"`:''}>${this.#descripcion}</a>
        `;
	}
}

export {Etiqueta};