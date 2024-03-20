import { PaginaInicio } from '../pantallas/todas.js';
import inicializarListas from './inicializar-listas.js';

let pagina = PaginaInicio({ usuario: window.usuarioActual }, location.search);
let desplinf = pagina.partes[2];
desplinf.pagina = 2;
inicializarListas();

//Al clickear etiqueta la agrega a la busqueda


if (window.location.href.includes("searchInput") || window.location.href.includes("etiquetas")) {

    document.addEventListener('click', function (event) {
        // Evitar el comportamiento predeterminado del clic


        if (event.target.className == "tag") {
            event.preventDefault();

            document.querySelector('a.dropdown-item[data-value="' + event.target.href.split("=")[1] + '"]').click()
        }

    });
}