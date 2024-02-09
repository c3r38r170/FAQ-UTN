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
                new EnlaceNavegacion('Suscripciones',{tipo:'solid',nombre:'arrow-right'}, '/suscripciones'),
                new EnlaceNavegacion('Perfil',{tipo:'regular',nombre:'user'},'/perfil')
            ];
        }
        
    }

	render(){
        return `<div id="navegacion-container">
                <ul class="navegacion">
                    ${this.#enlaces.reduce((s,en)=>s+en.render(),'')}
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