class Etiqueta{
    #descripcion;
	constructor({
        etiqueta
    }){
		this.#descripcion = etiqueta;
	}
	// ToDo Refactor: FALTA RUTA PARA VER ETIQUETAS 
	render(){
		return`
        <a class="etiqueta" href="">${this.#descripcion}</a>
        `;
	}
}

export {Etiqueta};