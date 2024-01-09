class Etiqueta{
    #descripcion;
	constructor({
        etiqueta
    }){
		this.#descripcion = etiqueta;
	}
	render(){
		return`
        <a class="etiqueta" src="">${this.#descripcion}</a>
        `;
	}
}

export {Etiqueta};