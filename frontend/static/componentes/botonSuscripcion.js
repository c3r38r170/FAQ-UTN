
import { Formulario } from './formulario.js'

class BotonSuscripcion{
    #endpoint;
    #formulario;
    #targetID;
    constructor(targetID, endpoint) {
        this.#targetID = targetID;
        this.#endpoint = endpoint;
        this.#formulario = new Formulario(
			'formularioSuscripcion'+targetID
			, this.#endpoint
			, []
			,this.procesarRespuesta
			,  {textoEnviar:'Suscribirse',verbo: 'POST',clasesBoton:'is-link is-small is-rounded'}
		);


      }

      procesarRespuesta(){
        e.preventDefault();
        console.log('Estas queriendp suscribirte a una pregunta/etiqueta');
      }

		
    render(){
        return`
        ${this.#formulario.render()}
        `
    }


}

export {BotonSuscripcion};