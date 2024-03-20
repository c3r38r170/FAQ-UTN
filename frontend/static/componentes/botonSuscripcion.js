
import { Formulario } from './formulario.js'

class BotonSuscripcion{
    #endpoint;
    #formulario;
    #targetID;
    #estaSuscripto;
    constructor(targetID, endpoint, estaSuscripto) {
        this.#estaSuscripto = estaSuscripto;
        this.#targetID = targetID;
        this.#endpoint = endpoint;

        // TODO Refactor: DRY
        if(this.#estaSuscripto){
            this.#formulario = new Formulario(
                'formularioSuscripcion'+targetID
                , this.#endpoint
                , []
                ,this.procesarDesuscripcion
                ,  {textoEnviar:'Desuscribirse',verbo: 'DELETE',clasesBoton:'ml-2 is-link is-small is-rounded is-outlined'}
            );
    
        }else{
            this.#formulario = new Formulario(
                'formularioSuscripcion'+targetID
                , this.#endpoint
                , []
                ,this.procesarSuscripcion
                ,  {textoEnviar:'Suscribirse',verbo: 'POST',clasesBoton:'ml-2 is-link is-small is-rounded'}
            );
        }


      }

      procesarSuscripcion(){ 
        setTimeout(() => {
            location.reload()
            console.log('Suscripcion')
        }, 1000);
    }

      procesarDesuscripcion(){ 
        setTimeout(() => {
            location.reload()
            console.log('Desuscripcion')
        }, 1000);
    }
		
    render(){
        return`
        ${this.#formulario.render()}
        `
    }


}

export {BotonSuscripcion};