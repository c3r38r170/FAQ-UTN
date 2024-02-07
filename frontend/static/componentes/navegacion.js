class Navegacion{

    //TODO REFACTOR
    // Comprobar sesion --> sino mostrar sólo búsqueda
    // Enviar objeto para mapear y renderizar el menú
	#enlaces = [];
    constructor(usuarioIdentificado){
        if(!usuarioIdentificado){
            // Visitante
            this.#enlaces=[new EnlaceNavegacion('Buscar',{tipo:'solid',nombre:'magnifying-glass'},'/explorar')];
        } else {
            // Si hay usuario, ver si es moderador o no

            this.#enlaces=[
                new EnlaceNavegacion('Buscar',{tipo:'solid',nombre:'magnifying-glass'},'/'),
                new EnlaceNavegacion('Preguntar',{tipo:'solid',nombre:'plus'},'/pregunta'),
                new EnlaceNavegacion('Suscripciones',{tipo:'solid',nombre:'arrow-right'}),
                new EnlaceNavegacion('Perfil',{tipo:'regular',nombre:'user'})
            ];
        }
        
    }

	render(){
        return `<div id="navegacion-container">
                <ul class="navegacion">

                    <li>
                        
                        <a id="link" href="http://localhost:8080/">
                            <i class="fa-solid fa-magnifying-glass mr-1"></i>
                            Buscar
                        </a>
                    </li>
                    <li>
                        <a id="link" src="./buscar">
                            <i class="fa-solid fa-plus mr-1"></i>
                            Preguntar
                        </a>
                    </li>
                    <li>
                        <a id="link" src="./buscar">
                            <i class="fa-solid fa-arrow-right mr-1"></i>
                            Suscripciones
                        </a>
                    </li>
                    <li>
                        <a id="link" href="http://localhost:8080/perfil">
                            <i class="fa-regular fa-user mr-1"></i>
                            Perfil
                        </a>
                    </li>
                    
                </ul>
            </div>`;
	}
}

class EnlaceNavegacion{
    #texto='';
    #enlace='';
    #icono={
        tipo:'' // solid, regular, etc...
        ,nombre:''
    }

    constructor(texto,icono,enlace=''){
        this.#texto=texto;
        this.#icono=icono;
        this.#enlace=enlace;
    }

    render(){
        return `<li>
                    
        <a id="link" href="${this.#enlace}">
            <i class="fa-${this.#icono.tipo} fa-${this.#icono.nombre} mr-1"></i>
            ${this.#texto}
        </a>
    </li>`
    }
}

export {Navegacion};