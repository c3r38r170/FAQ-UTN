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
            <button id="positiva" onclick="${this.votoPositivo()}">
                <span>
                    <i class="fa-solid fa-caret-up"></i>
                </span>
            </button>
            <div id="valoraciones">${this.#valoracion}</div>
            <button id="negativa" onclick="${this.votoNegativo()}">
                <span>
                    <i class="fa-solid fa-caret-down"></i>
                </span>
            </button>
        </div>
        `;
	}

    votoPositivo(){
        // código para implementar el voto positivo
      }

    votoNegativo(){
    // código para implementar el voto negativo
    }
}

export {ChipValoracion};