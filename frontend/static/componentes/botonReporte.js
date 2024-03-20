import { MensajeInterfaz } from "../componentes/mensajeInterfaz.js";

class BotonReporte{
    #postID;
    #modal;
    constructor(postID, modal) {
        this.#postID = postID;
        this.#modal = modal;
    }

    render(){
        return`
        <button class="reporte js-modal-trigger" data-target="${this.#modal.ID}" onclick="">
            <span>
                <i class="fa-sm fa-solid fa-circle-exclamation">
                </i>
            </span>
        </button>
        `
    }

    reportar(){
        // Implementar código de reporte de Post
        let mensaje = 'Quieres reportar el post #'+this.#postID
        this.#modal.contenido.push(new MensajeInterfaz(2,mensaje))
        this.#modal.render();
        
    }

}

export {BotonReporte};