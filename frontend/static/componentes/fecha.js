class Fecha{
    #opcionesDeFormato = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false };
    #fecha;
    #fechaformateada;
    constructor(fecha) {
        this.#fecha = new Date(fecha)
        this.#fechaformateada = this.#fecha.toLocaleDateString('es-ES', this.#opcionesDeFormato);
            
      }

    render(){
        return`
        <div id="fecha">${this.#fechaformateada}</div>
        `
    }

  

}

export {Fecha};