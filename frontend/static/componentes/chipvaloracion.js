class ChipValoracion{
    #estado;
	constructor({
        estado
    }){
		this.#estado = estado;
	}
	render(){
		return`
        <div id="triangulo">
        <a class="triangulo-redondeado"></a>
            
        </div>
        `;
	}
}

export {ChipValoracion};