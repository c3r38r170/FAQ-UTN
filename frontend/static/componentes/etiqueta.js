class Etiqueta{
    #descripcion;
	constructor({
        descripcion
    }){
		this.#descripcion = descripcion;
	}
	// ToDo Refactor: FALTA RUTA PARA VER ETIQUETAS 
	render(){
		return`
        <a class="etiqueta" href="">${this.#descripcion}</a>
        `;
	}
}

export {Etiqueta};