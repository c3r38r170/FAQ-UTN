class Notificacion{
    #descripcion;
	constructor({
        notificacion
    }){
		this.#descripcion = notificacion;
	}
	render(){
		return`
		<div class="notificacion">
			<div id="img-container">
				<img src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"/>
			</div>
			<div id="noti-container">
        		<a class="notificacion" src="">${this.#descripcion}</a>
				<div id="fecha">31 de Marzo de 2023</div>
			</div>
		</div>
        `;
	}
}

export {Notificacion};