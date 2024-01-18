class Navegacion{
	
	render(){
		return`
        <div id="navegacion-container">
            <ul class="navegacion">
                <li>
                    <img id="icono" src="">
                    </img>
                    <a id="link" href="http://localhost:8080/explorar">Buscar</a>
                </li>
                <li>
                    <img id="icono" src="">
                    </img>
                    <a id="link" src="./buscar">Preguntar</a>
                </li>
                <li>
                    <img id="icono" src="">
                    </img>
                    <a id="link" src="./buscar">Suscripciones</a>
                </li>
                <li>
                    <img id="icono" src="">
                    </img>
                    <a id="link" src="./buscar">Perfil</a>
                </li>
                
                
            </ul>
        </div>
        
        `;
	}
}

export {Navegacion};