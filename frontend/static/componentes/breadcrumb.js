class Breadcrumb{
    #ruta;
    #crumbs
	constructor(/* { */
        ruta
    /* } */){
        // ! Ojo que ruta arranca con /

        if (typeof ruta !== 'string') {
            throw new Error('El parámetro "ruta" debe ser una cadena (string).');
        }
		this.#ruta = ruta;
        //TODO Feature: / es index en Pagina, pero acá debería estar solo.
        this.#crumbs = this.generarBreadcrumb();
    }

    generarBreadcrumb() {
        // Divide la ruta en pedazos utilizando el separador "/"

        const partes = this.#ruta.split('/').filter(Boolean);

        
        // Crea los breadcrumbs a partir de las partes
        const breadcrumbs = partes.map((parte, index) => {
            const rutaParcial = `/${partes.slice(0, index + 1).join('/')}`;
            return { nombre: parte, ruta: rutaParcial };
        });


        return breadcrumbs;
    }
	render() {
        let html = ''
        html+= '<nav class="breadcrumb ml-5 pl-5" aria-label="breadcrumbs"><ul>'

        html += `<li id="breadcrumb"><a href="/"><i class="fa-solid fa-house fa-sm mr-2"></i>Inicio</a></li>`

        /*
        this.#crumbs.forEach((crumb, index) => {
            html += `<span id="breadcrumb"><i class="fa-solid fa-angle-right fa-sm"></i><a href="/${crumb.nombre}"> ${crumb.nombre}</a></span>`;
            
        });
        */
        this.#crumbs.forEach((crumb, index) => {
            if(crumb.nombre == 'index'){

            }else{
                let nombreCapitalizado = crumb.nombre.charAt(0).toUpperCase() + crumb.nombre.slice(1);
                html += `<li id="breadcrumb"><a class="crumb" href="${ crumb.nombre == 'pregunta' || crumb.nombre == 'perfil' || crumb.nombre == 'respuesta' ? '' :crumb.ruta}">${nombreCapitalizado}</a></li>`;
            }
            
        });

        html += '</ul></nav>'
        return html;

    }
}

export {Breadcrumb};