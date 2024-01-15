class ChipValoracion{
    #valoracion;
    #estado;
	constructor({
        valoracion,
        estado
    }){
        this.#valoracion = valoracion;
		this.#estado = estado;
	}
	render(){
		return`
        <div id="chip-valoracion">
            <button id="positiva">
                <span>
                    <i class="fa-solid fa-caret-up"></i>
                </span>
            </button>
            <div id="valoraciones">${this.#valoracion}</div>
            <button id="negativa">
                <span>
                    <i class="fa-solid fa-caret-down"></i>
                </span>
            </button>
        </div>
        `;
	}
}

export {ChipValoracion};