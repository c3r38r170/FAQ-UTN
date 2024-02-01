class Modal {
    #titulo;
    contenido = [];
    ID;
    constructor(titulo, modalID) {
      this.#titulo = titulo;
      this.ID = modalID;
    }

    rellenar(){
      
    }
  
    render() {
      return `
        <div id="${this.ID}" class="modal">
          <div class="modal-background"></div>
          <div class="modal-content">
            <div class="box">
              <h2 class="" style="text-align: center; margin-bottom: 2rem;">${this.#titulo}</h2>
              <p>${this.contenido.map((c) => c.render()).join("")}</p>
            </div>
          </div>
          <button class="modal-close is-large" aria-label="close"></button>
        </div>
      `;
    }
  }
  
export {Modal};
