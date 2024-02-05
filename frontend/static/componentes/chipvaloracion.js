import { SqS, gEt } from "../superFetch.js";

class ChipValoracion{

    static instancias={};
    #valoracion;
    #estado;
    #id //id del post
    #usuarioActual;
	constructor({
        ID,
        votos,
        usuarioActual
    }){
        this.#id = ID;
        ChipValoracion.instancias[this.#id]=this;
        this.#usuarioActual=usuarioActual;  
        this.#valoracion=votos.reduce((suma, voto)=>suma+=voto.valoracion,0);
        this.#estado=(votos.find(voto=>voto.votanteDNI==this.#usuarioActual.DNI))?.valoracion||0;

	}

    static votar(e){
		e.preventDefault();
        let botonApretado = e.target.closest("button");
        let divChipvaloracion = botonApretado.closest(".chip-valoracion");
        let id = divChipvaloracion.dataset.id;
        
        let estado = +divChipvaloracion.dataset.estado;
        let valoracion = +divChipvaloracion.dataset.valoracion;
        let valor =+botonApretado.value;
        console.log(valoracion, valor);
        
        
        const url= `http://localhost:8080/api/post/${id}/valoracion`;
        if(estado!=valor){ //si el voto ya esta puesto hace delete
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                valoracion: valor 
            })
        }).then(response=>{
            if(response.status==201){
                //TODO Feature: cambiar flechita
                let nuevaValoracion= valoracion+(valor-estado);
                document.getElementById("chip-valoracion-"+id+"-numero").innerHTML=nuevaValoracion;
                divChipvaloracion.dataset.valoracion=nuevaValoracion;
                divChipvaloracion.dataset.estado=valor;
            }
        });
        
        }else{
            fetch(url, {
                method: 'DELETE'
            }).then(response=>{
                if(response.status==201){
                    //TODO Feature: cambiar flechita
                    let nuevaValoracion= valoracion-estado;
                    document.getElementById("chip-valoracion-"+id+"-numero").innerHTML=nuevaValoracion;
                    divChipvaloracion.dataset.valoracion=nuevaValoracion;
                    divChipvaloracion.dataset.estado=0;
                }
            });
            }
        }


	render(){
		return`
        <div id="chip-valoracion-${this.#id}" data-id='${this.#id}' data-valoracion='${this.#valoracion}' data-estado='${this.#estado}' class="chip-valoracion">
            <button id="positiva" value='1' onclick="ChipValoracion.votar(event)">
                <span>
                    <i class="fa-solid fa-caret-up"></i>
                </span>
            </button>
            <div id="chip-valoracion-${this.#id}-numero" class="valoraciones" >${this.#valoracion}</div>
            <button id="negativa" value ='-1' onclick="ChipValoracion.votar(event)">
                <span>
                    <i class="fa-solid fa-caret-down"></i>
                </span>
            </button>
        </div>
        `;
	}
    
}

export {ChipValoracion};