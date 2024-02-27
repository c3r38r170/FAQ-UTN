import { SqS, gEt } from "../libs/c3tools.js";

class ChipValoracion{

    //TODO Feature: puse un rojo cualquiera para el voto hecho, cambiar por otro mas lindo
    static instancias={};
    #valoracion;
    #estado;
    #id; //id del post
    #usuarioActual;
	constructor({
        ID,
        votos,
        usuarioActual: sesion
    }){
        this.#id = ID;
        // TODO Refactor: Simplificar el uso de sesiones a usuario y punto, y no sesion.usuario  Esto pasa en los chips, en pregunta y en respuesta, principalmente.
        this.#usuarioActual=sesion?.usuario;
        this.#valoracion=votos.reduce((suma, voto)=>suma+=voto.valoracion,0);
        if(this.#usuarioActual===undefined){
            this.#estado=0;
        }else{
            this.#estado=(votos.find(voto=>voto.votanteDNI==this.#usuarioActual.DNI))?.valoracion||0;
        }

	}

    static votar(e){
		e.preventDefault();
        let botonApretado = e.target.closest("button");
        let divChipvaloracion = botonApretado.closest(".chip-valoracion");
        let id = divChipvaloracion.dataset.id;
        let estado = +divChipvaloracion.dataset.estado;
        let valoracion = +divChipvaloracion.dataset.valoracion;
        let valor =+botonApretado.value;
        let iPos = document.getElementById("iPos-"+id);
        let iNeg = document.getElementById("iNeg-"+id);
        
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
                if(valor==1){
                    iPos.style.color="#B90E0A";
                    iNeg.style.color ="";
                }else if(valor==-1){
                    iNeg.style.color="#B90E0A";
                    iPos.style.color ="";
                }
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
                    iNeg.style.color="";
                    iPos.style.color ="";
                }
            });
            }
        }


	render(){
		return`
        <div id="chip-valoracion-${this.#id}" data-id='${this.#id}' data-valoracion='${this.#valoracion}' data-estado='${this.#estado}' class="chip-valoracion">
            <button class="positiva" value='1' onclick="ChipValoracion.votar(event)" ${this.#usuarioActual=== undefined?"disabled":''}>
                <span>
                    <i id="iPos-${this.#id}" class="fa-solid fa-caret-up" ${this.#estado == 1 ? 'style="color: #B90E0A"':''}></i>
                </span>
            </button>
            <div id="chip-valoracion-${this.#id}-numero" class="valoraciones" >${this.#valoracion}</div>
            <button class="negativa" value ='-1' onclick="ChipValoracion.votar(event)" ${this.#usuarioActual=== undefined?"disabled":''}>
                <span>
                    <i id="iNeg-${this.#id}" class="fa-solid fa-caret-down" ${this.#estado == -1 ? 'style="color: #B90E0A"':''}></i>
                </span>
            </button>
        </div>
        `;
	}
    
}

export {ChipValoracion};