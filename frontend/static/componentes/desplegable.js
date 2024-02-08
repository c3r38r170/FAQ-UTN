class Desplegable{

    #idDesplegable;
    #titulo;
    opciones = [];
    #tipoPorDefecto;
    htmlOpciones={
        link:opcion=>`<a href="${opcion.href}" class="dropdown-item">${opcion.descripcion}</a>`
        ,div:opcion=>`<div class="dropdown-item">${opcion.descripcion}</div>`
        ,option:opcion=>`<option value="${opcion.value}">${opcion.descripcion}</option>`
    }

    /* EJEMPLO
    {
        descripcion: 'Opcion1',
        tipo: 'link',  --> Renderiza un elemento a, sino renderiza un div
        href: '#'
    }
    */

    // TODO Feature:
    // Faltaría una implementacion de tipo: option en el caso que utilicemos en formulario

// TODO Refactor: Considerar meter opciones a opcional como tipoPorDefecto
    constructor(idDesplegable, titulo,opciones = [],{tipoPorDefecto='div'}={}){
        this.#titulo = titulo;
        this.#idDesplegable = idDesplegable;
        this.opciones=opciones;
        this.#tipoPorDefecto=tipoPorDefecto;
    }

    render(){
        let elementoContenedor=({
            div:'div',
            option:'select'
        })[this.#tipoPorDefecto];

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
                <${elementoContenedor} class="dropdown-content">
                    ${this.opciones.map(opc=>this.htmlOpciones[opc.tipo||this.#tipoPorDefecto](opc)).join('')}
                </${elementoContenedor}>
            </div>
        </div>
        
        `

    }



}

export { Desplegable }