class Fecha{
    static get CORTA(){
        return false
    };
    static get LARGA(){
        return true;
    }
    static #opcionesDeFormato = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
    // TODO Feature: Ver si hace falta un formato corto con hora.
    static #opcionesDeFormatoCorto= { year: 'numeric', month: 'numeric', day: 'numeric' };
    #fecha;
    #fechaformateada;
    constructor(fecha,larga=true) {
        this.#fecha = new Date(fecha)
        // TODO Refactor: toLocaleString vs toLocaleDateString
        this.#fechaformateada = this.#fecha.toLocaleDateString('es-ES', larga?Fecha.#opcionesDeFormato:Fecha.#opcionesDeFormatoCorto);
            
      }

    render(){
        return`
        <span class="fecha">${this.#fechaformateada}</span>
        `
    }

  

}

export {Fecha};