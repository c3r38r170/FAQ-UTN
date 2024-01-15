class Breadcrumb{
    #ruta;
    #crumbs
	constructor({
        ruta
    }){
        console.log('Valor de ruta en el constructor:', ruta);

        if (typeof ruta !== 'string') {
            throw new Error('El parámetro "ruta" debe ser una cadena (string).');
        }
		this.#ruta = ruta;
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
        html+= '<div id="breadcrumbs">'

        this.#crumbs.forEach((crumb, index) => {
            html += `<span id="breadcrumb"><i class="fa-solid fa-angle-right fa-sm"></i><a href="http://localhost:8080/${crumb.nombre}"> ${crumb.nombre}</a></span>`;

            
        });

        html += '</div>'
        return html;
    }
}

export {Breadcrumb};