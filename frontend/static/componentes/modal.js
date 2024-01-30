class Modal {
    #titulo;
    contenido = [];
    #modal;
    constructor(titulo, modalID) {
      this.#titulo = titulo;
      this.#modal = modalID;
    }
  
    render() {
      return `
        <div id="${this.#modal}" class="modal">
          <div class="modal-background"></div>
          <div class="modal-content">
            <div class="box">
              <h2>${this.#titulo}</h2>
              <p>${this.contenido.map((c) => c.render()).join("")}</p>
            </div>
          </div>
          <button class="modal-close is-large" aria-label="close"></button>
        </div>
      `;
    }
  }
  
export {Modal};
