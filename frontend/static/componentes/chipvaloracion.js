import { SqS, gEt } from "../libs/c3tools.js";

//TODO Feature: puse un rojo cualquiera para el voto hecho, cambiar por otro mas lindo
class ChipValoracion {
    static instancias = {};


    #valoracion;
    #estado;
    #id; //id del post
    #usuarioActual;
    #duenio
    constructor({
        ID,
        votos,
        usuarioActual: usuario,
        duenio: duenio
    }) {
        this.#id = ID;
        // TODO Refactor: Simplificar el uso de sesiones a usuario y punto, y no sesion.usuario  Esto pasa en los chips, en pregunta y en respuesta, principalmente.
        this.#usuarioActual = usuario;
        this.#valoracion = votos.reduce((suma, voto) => suma += voto.valoracion, 0);
        if (!this.#usuarioActual) {
            this.#estado = 0;
        } else {
            this.#estado = (votos.find(voto => voto.votanteDNI == this.#usuarioActual.DNI))?.valoracion || 0;
        }
        this.#duenio = duenio
        //console.log("actual " + this.#usuarioActual?.DNI)
        //console.log("duenio " + this.#duenio?.DNI)

    }

    static votar(e) {
        e.preventDefault();
        let botonApretado = e.target.closest("button");
        let divChipvaloracion = botonApretado.closest(".chip-valoracion");
        let id = divChipvaloracion.dataset.id;
        let estado = +divChipvaloracion.dataset.estado;
        let valoracion = +divChipvaloracion.dataset.valoracion;
        let valor = +botonApretado.value;
        let iPos = document.getElementById("iPos-" + id);
        let iNeg = document.getElementById("iNeg-" + id);

        const url = `/api/post/${id}/valoracion`;
        if (estado != valor) { //si el voto ya esta puesto hace delete
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    valoracion: valor
                })
            }).then(response => {
                if (response.status == 201) {
                    let nuevaValoracion = valoracion + (valor - estado);
                    document.getElementById("chip-valoracion-" + id + "-numero").innerHTML = nuevaValoracion;
                    divChipvaloracion.dataset.valoracion = nuevaValoracion;
                    divChipvaloracion.dataset.estado = valor;
                    if (valor == 1) {
                        iPos.style.color = '#485fc7';
                        iNeg.style.color = "";
                    } else if (valor == -1) {
                        iNeg.style.color = '#485fc7';
                        iPos.style.color = "";
                    }
                }
            }).catch(error => {
                console.error('Error al votar:', error);
            });
        } else {
            fetch(url, {
                method: 'DELETE'
            }).then(response => {
                if (response.status == 201) {
                    let nuevaValoracion = valoracion - estado;
                    document.getElementById("chip-valoracion-" + id + "-numero").innerHTML = nuevaValoracion;
                    divChipvaloracion.dataset.valoracion = nuevaValoracion;
                    divChipvaloracion.dataset.estado = 0;
                    iNeg.style.color = "";
                    iPos.style.color = "";
                }
            }).catch(error => {
                console.error('Error al votar:', error);
            });
        }
    }


    render() {
        return `
        <div id="chip-valoracion-${this.#id}" data-id='${this.#id}' data-valoracion='${this.#valoracion}' data-estado='${this.#estado}' class="chip-valoracion">
            <button class="positiva" value='1' onclick="ChipValoracion.votar(event)" ${!this.#usuarioActual || this.#usuarioActual.DNI == this.#duenio.DNI ? "disabled" : ''}>
                <span>
                    <i id="iPos-${this.#id}" class="fa-solid fa-caret-up" ${this.#estado == 1 ? 'style="color: #485fc7"' : ''}></i>
                </span>
            </button>
            <div id="chip-valoracion-${this.#id}-numero" class="valoraciones" >${this.#valoracion}</div>
            <button class="negativa" value ='-1' onclick="ChipValoracion.votar(event)" ${!this.#usuarioActual || this.#usuarioActual.DNI == this.#duenio.DNI ? "disabled" : ''}>
                <span>
                    <i id="iNeg-${this.#id}" class="fa-solid fa-caret-down" ${this.#estado == -1 ? 'style="color: #485fc7"' : ''}></i>
                </span>
            </button>
        </div>
        `;
    }

}

export { ChipValoracion };