import { Fecha } from "./fecha.js"

// TODO Refactor: Propiedades como CORTO o LARGO de fecha, pero para si es completo o simple (u otro par de adjetivos)
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
        ,fecha_alta
    },esPerfil=false){
        this.#DNI = DNI;
		this.#nombreusuario = nombre;
        this.#correo = correo;
        this.#createdAt = new Fecha(fecha_alta || createdAt);
        this.#esPerfil = esPerfil;
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