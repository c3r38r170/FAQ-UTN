class ChipUsuario{
    #nombreusuario;
	constructor({
        nombre
    }){
		this.#nombreusuario = nombre;
	}
	render(){
		return`
        <div class="chip-usuario is-vcentered">
            <img class="mr-3 img-usuario" src="../user.webp" ></img>
            <div class="nombre-usuario">${this.#nombreusuario}</div>
            <div class="tipo-usuario">Usuario</div>
        </div>
        `;
	}
}

export {ChipUsuario};