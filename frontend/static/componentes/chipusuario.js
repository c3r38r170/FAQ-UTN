import { Fecha } from "./fecha.js"

class ChipUsuario{
    #DNI
    #nombreusuario;
    #correo
    #createdAt
    #esPerfil;

	constructor({
        DNI
        ,nombre
        ,correo
        ,createdAt
    },esPerfil){
        this.#DNI = DNI;
		this.#nombreusuario = nombre;
        this.#correo = correo;
        this.#createdAt = new Fecha(createdAt);
        this.#esPerfil = esPerfil;
	}
	render(){

        if(this.#esPerfil){
            return`
            <div class="chip-usuario-perfil">
                <img class="mr-3 img-usuario" src="../user.webp" ></img>
                <div class="contenido-perfil">
                    <div>DNI: <span>${this.#DNI}</span></div>
                    <div>Nombre: <span>${this.#nombreusuario}</span></div>
                    <div>Correo electrónico: <span>${this.#correo}</span></div>
                    <div>Miembro desde: <span>${this.#createdAt.render()}</span></div>
                    <div class="tipo-usuario">Usuario</div>
                </div>
            </div>
            `;
        }else{
            return`
            <div class="chip-usuario is-vcentered">
                <img class="mr-3 img-usuario" src="../user.webp" ></img>
                <a class="nombre-usuario" href="/perfil/${this.#DNI}">${this.#nombreusuario}</a>
                <div class="tipo-usuario">Usuario</div>
            </div>
            `;
        }
	}
}

export {ChipUsuario};