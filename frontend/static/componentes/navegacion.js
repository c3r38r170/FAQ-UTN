class Navegacion{
	
    constructo(sesion){
        
    }

	render(){
		return`
        <div id="navegacion-container">
            <ul class="navegacion">
                <li>
                    
                    <a id="link" href="http://localhost:8080/explorar">
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
                        <i class="fa-solid fa-user mr-1"></i>
                        Perfil
                    </a>
                </li>
                
                
            </ul>
        </div>
        
        `;
	}
}

export {Navegacion};