class Navegacion{

    //TODO REFACTOR
    // Comprobar sesion --> sino mostrar sólo búsqueda
    // Enviar objeto para mapear y renderizar el menú
	#enlaces = [];
    constructor(usuarioIdentificado, ruta){
        if(!usuarioIdentificado){
            // Visitante
            this.#enlaces=[new EnlaceNavegacion('Buscar',{tipo:'solid',nombre:'magnifying-glass'},'/explorar')];
        } else {
            let perfil =new EnlaceNavegacion('Perfil',{tipo:'regular',nombre:'user'},'/perfil');

            //si esta en ruta perfil
            //TODO: Refactor para no crear el objeto principal otra vez
            if(ruta=="/perfil" || ruta=="/perfil/preguntas" || ruta=="/perfil/respuestas")
                perfil = new EnlaceNavegacion('Perfil',{tipo:'regular',nombre:'user', subenlaces:[
                    new EnlaceNavegacion('Información',{tipo:'solid',nombre:'circle'},'/perfil'),
                    new EnlaceNavegacion('Preguntas',{tipo:'solid',nombre:'circle'},'/perfil/preguntas'),
                    new EnlaceNavegacion('Respuestas',{tipo:'solid',nombre:'circle'},'/perfil/respuestas')
        ]},'/perfil');

            this.#enlaces=[
                new EnlaceNavegacion('Buscar',{tipo:'solid',nombre:'magnifying-glass'},'/explorar'),
                new EnlaceNavegacion('Preguntar',{tipo:'solid',nombre:'plus'},'/pregunta'),
                new EnlaceNavegacion('Suscripciones',{tipo:'solid',nombre:'arrow-right'}, '/suscripciones'),
                perfil
            ];
            if(usuarioIdentificado.perfil.permiso.ID>=2){
                //Enlances para moderadores
                let moderacion =new EnlaceNavegacion('Moderación',{tipo:'solid',nombre:'user-tie'},'/moderacion/usuarios');

                //si esta en ruta perfil
                //TODO: Refactor para no crear el objeto principal otra vez
                //TODO: esto es un placeholder
                if(ruta=="/moderacion/preguntas" || ruta=="/moderacion/usuarios" || ruta=="/moderacion/etiquetas")
                    moderacion = new EnlaceNavegacion('Moderación',{tipo:'solid',nombre:'user-tie', subenlaces:[
                        new EnlaceNavegacion('Usuarios',{tipo:'solid',nombre:'circle'},'/moderacion/usuarios'),
                        new EnlaceNavegacion('Preguntas',{tipo:'solid',nombre:'circle'},'/moderacion/preguntas'),
                        new EnlaceNavegacion('Etiquetas',{tipo:'solid',nombre:'circle'},'/moderacion/etiquetas')]},'/moderacion/usuarios');
                this.#enlaces.push(moderacion)
            }
            if(usuarioIdentificado.perfil.permiso.ID>=3){
                //TODO: Refactor para no crear el objeto principal otra vez
                //TODO: esto es un placeholder
                let administracion =new EnlaceNavegacion('Administracion',{tipo:'solid',nombre:'user-secret'},'/Administracion/perfiles');

                if(ruta=="/administracion" || ruta=="/administracion/perfiles" || ruta=="/administracion/etiquetas"){
                    administracion = new EnlaceNavegacion('Administración',{tipo:'solid',nombre:'user-secret', subenlaces:[
                        new EnlaceNavegacion('Perfiles',{tipo:'solid',nombre:'circle'},'/administracion/perfiles'),
                        new EnlaceNavegacion('Etiquetas',{tipo:'solid',nombre:'circle'},'/administracion/etiquetas'),]},'/administracion/perfiles');
                }
                this.#enlaces.push(administracion)

            }
            
        }
        
    }

	render(){
        return `<div id="navegacion-container">
                <ul class="navegacion">
                    ${this.#enlaces.reduce((s,en)=>s+en.render(),'')}
                </ul>
            </div>`;
            
	}
}

class EnlaceNavegacion{
    #texto='';
    #enlace='';
    #icono={
        tipo:'' // solid, regular, etc...
        ,nombre:''
    }
    //TODO Refactor: por alguna razón los subenlances están adentro de tipo
    constructor(texto,icono,enlace=''){
        this.#texto=texto;
        this.#icono=icono;
        this.#enlace=enlace;
    }

    render(){
        let subnavegacionHTML = '';
        if (this.#icono.subenlaces) {
            subnavegacionHTML = `<ul class="subnavegacion">
                ${this.#icono.subenlaces.reduce((s, en) => s + en.render(), '')}
            </ul>`;
        }
        
        return `<li>
            <a id="link" href="${this.#enlace}">
                <i class="fa-${this.#icono.tipo} fa-${this.#icono.nombre} mr-1"></i>
                ${this.#texto}
            </a>
            ${subnavegacionHTML}
        </li>`;
    }
}




export {Navegacion};