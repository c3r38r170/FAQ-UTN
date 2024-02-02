class Navegacion{

    //TODO REFACTOR
    // Comprobar sesion --> sino mostrar sólo búsqueda
    // Enviar objeto para mapear y renderizar el menú
	#usuario = null;
    constructor(sesion){
        
        if (sesion && sesion.usuario) {
            this.#usuario = sesion.usuario;
        } else {
            // Manejar el caso en el que sesion o sesion.usuario sea undefined

        }
        
    }

	render(){

        if(this.#usuario){
            return`
            <div id="navegacion-container">
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
                        <a id="link" src="./buscar">
                            <i class="fa-regular fa-user mr-1"></i>
                            Perfil
                        </a>
                    </li>
                    
                    
                </ul>
            </div>
            
            `;
        }else{
            return `
            <div id="navegacion-container">
            <ul class="navegacion">
                <li>
                    
                    <a id="link" href="http://localhost:8080/explorar">
                        <i class="fa-solid fa-magnifying-glass mr-1"></i>
                        Buscar
                    </a>
                </li>
            </ul>
            </div>
            `
        }
	}
}

export {Navegacion};