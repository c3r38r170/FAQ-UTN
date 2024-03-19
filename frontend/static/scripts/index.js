import { PaginaInicio } from '../pantallas/todas.js';
import inicializarListas from './inicializar-listas.js';

let pagina = PaginaInicio({ usuario: window.usuarioActual }, location.search);
let desplinf = pagina.partes[2];
desplinf.pagina = 2;
inicializarListas();

//Al clickear etiqueta la agrega a la busqueda
if (window.location.href.includes("searchInput") || window.location.href.includes("etiquetas")) {
    document.querySelectorAll('.tag').forEach(item => {
        // Agregar un listener de eventos para cada elemento
        item.addEventListener('click', function (event) {
            // Evitar el comportamiento predeterminado del clic
            event.preventDefault();

            // Aquí puedes definir tu propia lógica
            document.querySelector('a.dropdown-item[data-value="' + item.href.split("=")[1] + '"]').click()
            // Por ejemplo, puedes hacer algo como esto:
            // alert('Hiciste clic en un elemento con la clase "tag".');
        });
    });
}