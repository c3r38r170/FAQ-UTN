class Modal {
  titulo='';
  contenido = [];
  ID='';
  
  constructor(titulo, modalID) {
    this.titulo = titulo;
    this.ID = modalID;
  }

  rellenar(){
    
  }

  // TODO Refactor: Cambiar el nombre de este método (a rellenar como el de arriba, o a otro más apropiado. No se para qué era el rellenar). Lo que hace es volver a renderizar el componente, volviendo a considerar el contenido.
  redibujar(){
    let modal=document.getElementById(this.ID);
    modal.querySelector(`.box`).firstElementChild.innerHTML=this.titulo;
    modal.querySelector(`.contenido`).innerHTML=this.generarContenido();
  }

  render() {
    return `
      <div id="${this.ID}" class="modal">
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="box">
            <h2 class="" style="text-align: center; margin-bottom: 2rem;">${this.titulo}</h2>
            <div class="contenido">${this.generarContenido()}</div>
          </div>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
      </div>
    `;
  }

  generarContenido() {
    return this.contenido.reduce((acc,c) => acc+c.render(),'');
  }
}
  
export {Modal};
