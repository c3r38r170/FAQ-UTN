import { Formulario } from './formulario.js';

class Etiqueta{
    #descripcion;
	#ID;
	#enlazar=true;
  #categoria;
  #suscripto=null;

	constructor({
    ID, descripcion, enlazar=true, categoria, suscripciones
  }){
    this.#ID = ID;
		this.#descripcion = descripcion;
		this.#enlazar = enlazar;
    this.#categoria = categoria;
    this.#suscripto = suscripciones?!!suscripciones.length:null;
	}
	render(){
    
    let casoSuscripcion=this.#suscripto==null?
      '':
      new Formulario(
        'etiquetas-suscribir-'+this.#ID+'-'+new String(Math.random()).substring(2)
        ,`/api/etiqueta/${this.#ID}/suscripcion`
        ,[]
        // TODO Refactor: Hacerlo función de Etiqueta, y exponer Etiqueta. Furthermore, quizá eliminar el formulario y hacerlo un onclick... con solo un botón (y metadata). algún día.
        ,(txt, { ok, codigo })=>{
          if(ok){
            if(codigo!=204){
              let estaSuscrito = codigo==201;
              let verbos=['POST','DELETE'];
              let claseIcono=['fa-bell','fa-bell-slash'];
  
              for(let form of SqS(`[id^="${/* formularioID */'etiquetas-suscribir-'+txt}"]`,{n:ALL})){
                Formulario.instancias[form.id].verbo=verbos[+estaSuscrito];
      
                let boton=form.querySelector('button.fa');
                boton.classList.replace(claseIcono[+!!(estaSuscrito-1)],claseIcono[+estaSuscrito]);

                if(boton.previousElementSibling){
                  boton.previousElementSibling.remove();
                  boton.parentNode.disabled=false;
                }
              }
            }
          }else{
            Swal.error(txt);
          }
        }
        ,{
          clasesBoton:'is-small fa fa-bell'+(this.#suscripto?'-slash':'')
          ,verbo:this.#suscripto?'DELETE':'POST'
          , textoEnviar:''
        }
      ).render()
    ;
		return`<div class="tags has-addons"><a class="tag" style="background-color: ${this.#categoria.color}" ${this.#enlazar?`href="/?etiquetas=${this.#ID}"`:''}>${this.#descripcion}</a>${casoSuscripcion}</div>`;
  }

}

export { Etiqueta };
