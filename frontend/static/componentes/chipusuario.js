class ChipUsuario{
    #nombreusuario;
	constructor({
        nombre
    }){
		this.#nombreusuario = nombre;
         console.log('CHIPUSUARIO CONSTRUCTOR',nombre)
	}
	render(){
		return`
        <div class="columns chip-usuario is-vcentered">
            <div class="column is-narrow">
                <img id="img-usuario" ></img>
            </div>
            <div class="column is-narrow pl-0">
                <div id="nombre-usuario">${this.#nombreusuario}</div>
                <div id="tipo-usuario">Tipo Usuario</div>
            </div>
        </div>
        `;
	}
}

export {ChipUsuario};