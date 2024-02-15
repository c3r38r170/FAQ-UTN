import { Fecha } from "./fecha.js"

class ChipUsuario{
    #DNI
    #nombreusuario;
    #correo
    #createdAt
    #esPerfil;
    #tipo;
    #color;

	constructor({
        DNI
        ,nombre
        ,correo
        ,createdAt
        ,perfil
    },esPerfil){
        this.#DNI = DNI;
		this.#nombreusuario = nombre;
        this.#correo = correo;
        this.#createdAt = new Fecha(createdAt);
        this.#esPerfil = esPerfil;
        this.#tipo =perfil ? perfil.nombre:"Usuario";
        this.#color = perfil? perfil.color :"#485fc7"
	}
	render(){
        //TODO Feature Tipo de Usuario

        if(this.#esPerfil){
            return`
            <div class="chip-usuario-perfil">
                <img class="mr-3 img-usuario" src="../user.webp" ></img>
                <div class="contenido-perfil">
                    <div>DNI: <span>${this.#DNI}</span></div>
                    <div>Nombre: <span>${this.#nombreusuario}</span></div>
                    <div>Correo electrónico: <span>${this.#correo}</span></div>
                    <div>Miembro desde: <span>${this.#createdAt.render()}</span></div>
                    <div class="tipo-usuario" style="background-color: ${this.#color}">${this.#tipo}</div>
                </div>
            </div>
            `;
        }else{
            return`
            <div class="chip-usuario is-vcentered">
                <img class="mr-3 img-usuario" src="../user.webp" ></img>
                <a class="nombre-usuario" href="/perfil/${this.#DNI}">${this.#nombreusuario}</a>
                <div class="tipo-usuario">${this.#tipo}</div>
            </div>
            `;
        }
	}
}

export {ChipUsuario};