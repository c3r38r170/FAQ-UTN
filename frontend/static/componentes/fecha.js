class Fecha{
    #opcionesDeFormato = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
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