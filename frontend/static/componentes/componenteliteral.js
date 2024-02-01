class ComponenteLiteral{
	// * Para casos de un solo uso, donde querramos inyectar algo de HTML o un componente nuevo muy específico. También da flexibilidad entre líneas de desarrollo, para no tener que esperar a que se cree algun componente para probar cosas.
	#funcion=null;
	constructor(funcion){
		this.#funcion=funcion;
	}
	render(){
		return this.#funcion();
	}
}

export {ComponenteLiteral};