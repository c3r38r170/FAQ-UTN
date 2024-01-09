class ChipUsuario{
    #nombreusuario;
    #tipousuario;
    #imagenperfil;
	constructor({
        nombre, tipo, imagen
    }){
		this.#nombreusuario = nombre;
        this.#tipousuario = tipo;
         this.#imagenperfil = imagen;
	}
	render(){
		return`
        <div class="columns chip-usuario is-vcentered">
            <div class="column is-narrow">
                <img id="img-usuario" src="${this.#imagenperfil}"></img>
            </div>
            <div class="column is-narrow">
                <div id="nombre-usuario">${this.#nombreusuario}</div>
                <div id="tipo-usuario">${this.#tipousuario}</div>
            </div>
        </div>
        `;
	}
}

export {ChipUsuario};