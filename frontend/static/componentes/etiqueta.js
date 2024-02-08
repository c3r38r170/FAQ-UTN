class Etiqueta{
    #descripcion;
	#ID;
	constructor({
        ID, descripcion
    }){
		this.#descripcion = descripcion;
		this.#ID = ID;
	}
	// ToDo Refactor: FALTA RUTA PARA VER ETIQUETAS 
	render(){
		return`
        <a class="etiqueta" href="/etiqueta/${this.#ID}/preguntas">${this.#descripcion}</a>
        `;
	}
}

export {Etiqueta};