class Desplegable{

    #idDesplegable;
    #titulo;
    opciones = [];

    /* EJEMPLO
    {
        descripcion: 'Opcion1',
        tipo: 'link',  --> Renderiza un elemento a, sino renderiza un div
        href: '#'
    }
    */

    // TODO Feature:
    // Faltaría una implementacion de tipo: option en el caso que utilicemos en formulario

    constructor(idDesplegable, titulo){
        this.#titulo = titulo;
        this.#idDesplegable = idDesplegable;
    }

    

    render(){
        

        return `
        <div class="dropdown is-hoverable" id="${this.#idDesplegable}">
            <div class="dropdown-trigger">
                <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                    <span>${this.#titulo}</span>
                    <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                    ${this.opciones.map(option => option.tipo === 'link'
                    ? `<a href="${option.href}" class="dropdown-item">${option.descripcion}</a>`
                    : `<div class="dropdown-item">${option.descripcion}</div>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        `

    }



}

export { Desplegable }