class BotonReporte{
    #idPost
    constructor({
        idPost

    }) {
        this.#idPost = idPost;
      }

    render(){
        return`
        <button id="reporte" onclick="${this.reportar()}">
            <span>
                <i class="fa-sm fa-solid fa-circle-exclamation">
                </i>
            </span>
        </button>
        `
    }

    reportar(){
        // Implementar código de reporte de Post
    }

}

export {BotonReporte};