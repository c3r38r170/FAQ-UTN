
import { Formulario } from './formulario.js'

class BotonSuscripcion {
    #endpoint;
    #formulario;
    #targetID;
    #estaSuscripto;
    constructor(targetID, endpoint, estaSuscripto) {
        this.#estaSuscripto = estaSuscripto;
        this.#targetID = targetID;
        this.#endpoint = endpoint;

        // TODO Refactor: DRY
        if (this.#estaSuscripto) {
            this.#formulario = new Formulario(
                'formularioSuscripcion' + targetID
                , this.#endpoint
                , []
                , this.procesarDesuscripcion
                , { textoEnviar: 'Desuscribirse', verbo: 'DELETE', clasesBoton: 'ml-2 is-link is-small is-rounded is-outlined' }
            );

        } else {
            this.#formulario = new Formulario(
                'formularioSuscripcion' + targetID
                , this.#endpoint
                , []
                , this.procesarSuscripcion
                , { textoEnviar: 'Suscribirse', verbo: 'POST', clasesBoton: 'ml-2 is-link is-small is-rounded' }
            );
        }


    }

    procesarSuscripcion(targetID, res) {
        setTimeout(() => {
            //location.reload()
            try {
                let form = document.getElementById("formularioSuscripcion" + targetID);
                let boton = form.getElementsByTagName("button")[0];
                boton.className = "button ml-2 is-link is-small is-rounded is-outlined";
                boton.innerText = "Desuscribirse"
                let fieldset = form.getElementsByTagName("fieldset")[0];
                fieldset.disabled = false;
                let div = form.getElementsByTagName("div")[0];
                div.remove();
            } catch { }
        }, 1000);
    }

    procesarDesuscripcion(targetID, res) {
        setTimeout(() => {
            //location.reload()
            try {
                let form = document.getElementById("formularioSuscripcion" + targetID);
                let boton = form.getElementsByTagName("button")[0];
                boton.className = "button is-link ml-2 is-link is-small is-rounded";
                boton.innerText = "Suscribirse";
                let fieldset = form.getElementsByTagName("fieldset")[0];
                fieldset.disabled = false;
                let div = form.getElementsByTagName("div")[0];
                div.remove();
            }
            catch { }
        }, 1000);
    }


    render() {
        return `<div id="formDesuscripcion-${this.#targetID}">
        ${this.#formulario.render()}
        </div>`
    }


}

export { BotonSuscripcion };