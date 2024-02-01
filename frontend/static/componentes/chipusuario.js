class ChipUsuario{
    #nombreusuario;
	constructor({
        nombre
    }){
		this.#nombreusuario = nombre;
	}
	render(){
		return`
        <div class="columns chip-usuario is-vcentered">
            <div class="column is-narrow">
                <img id="img-usuario" src="../user.webp" ></img>
            </div>
            <div class="column is-narrow pl-0">
                <div id="nombre-usuario">${this.#nombreusuario}</div>
                <div id="tipo-usuario">Usuario</div>
            </div>
        </div>
        `;
	}
}

export {ChipUsuario};