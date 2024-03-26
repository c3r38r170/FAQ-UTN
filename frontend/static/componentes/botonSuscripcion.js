
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
        this.#formulario = new Formulario(
            'formularioSuscripcion' + targetID
            , this.#endpoint
            , []
            , this.procesarSuscripcion
            , this.#estaSuscripto ? { textoEnviar: 'Desuscribirse', verbo: 'DELETE', clasesBoton: 'ml-2 is-link is-small is-rounded is-outlined' } : { textoEnviar: 'Suscribirse', verbo: 'POST', clasesBoton: 'ml-2 is-link is-small is-rounded' }
        );
    }

    procesarSuscripcion(targetID, res) {
        setTimeout(() => {
            try {
                let form = document.getElementById("formularioSuscripcion" + targetID);
                let boton = form.getElementsByTagName("button")[0];
                if (Formulario.instancias['formularioSuscripcion' + targetID].verbo == "POST") {
                    boton.className = "button ml-2 is-link is-small is-rounded is-outlined";
                    boton.innerText = "Desuscribirse";
                    Formulario.instancias['formularioSuscripcion' + targetID].verbo = "DELETE";
                } else if (Formulario.instancias['formularioSuscripcion' + targetID].verbo == "DELETE") {
                    boton.className = "button is-link ml-2 is-link is-small is-rounded";
                    boton.innerText = "Suscribirse";
                    Formulario.instancias['formularioSuscripcion' + targetID].verbo = "POST";
                }
                let fieldset = form.getElementsByTagName("fieldset")[0];
                fieldset.disabled = false;
                let div = form.getElementsByTagName("div")[0];
                div.remove();
            } catch { }
        }, 1000);
    }


    render() {
        return `<div id="formDesuscripcion-${this.#targetID}">
        ${this.#formulario.render()}
        </div>`
    }


}

export { BotonSuscripcion };