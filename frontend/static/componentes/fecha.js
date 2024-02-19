class Fecha{
    static get CORTA(){
        return false
    };
    static get LARGA(){
        return true;
    }
    static #opcionesDeFormato = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
    static #opcionesDeFormatoCorto= { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
    #fecha;
    #fechaformateada;
    constructor(fecha,larga=true) {
        this.#fecha = new Date(fecha)
        // TODO Refactor: toLocaleString vs toLocaleDateString
        this.#fechaformateada = this.#fecha.toLocaleDateString('es-ES', larga?Fecha.#opcionesDeFormato:Fecha.#opcionesDeFormatoCorto);
            
      }

    render(){
        return`
        <div class="fecha">${this.#fechaformateada}</div>
        `
    }

  

}

export {Fecha};