class Modal {
    #title;
    #content;
    #modal;
    constructor(title, content, modal) {
      this.#title = title;
      this.#content = content;
      this.#modal = modal;
    }
  
    render() {
      return `
        <div id="${this.#modal}" class="modal">
	    <div class="modal-background"></div>
        <div class="modal-content">
            <div class="box">
            <h2>${this.#title}</h2>
            <p>${this.#content}</p>
            <!-- Tu contenido aquí -->
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
	</div>
      `;
    }
  }
  
export {Modal};
