import {SqS,gEt,createElement} from '../libs/c3tools.js';
// import BulmaTagsInput from 'https://cdn.jsdelivr.net/npm/@creativebulma/bulma-tagsinput@1.0.3/+esm';
import BulmaTagsInput from '../libs/bulmaTagsInput+esm.js'

class ListaEtiquetas {
    #etiquetas;
    #formID;
    
  constructor(formID) {
    this.#formID = formID;
    this.crearLista();
  }


  async crearLista(){
    try {
      // Fetch de etiquetas desde la API
      const response = await fetch('http://localhost:8080/api/etiqueta');
      this.#etiquetas = await response.json();

    
    // Procesamiento de las etiquetas
    const etiquetasIndexadasPorCategoria = {};
    for (let eti of this.#etiquetas) {
      if (!etiquetasIndexadasPorCategoria[eti.categoriaID]) {
        etiquetasIndexadasPorCategoria[eti.categoriaID] = { ...eti.categoria, etiquetas: [eti] };
      } else {
        etiquetasIndexadasPorCategoria[eti.categoriaID].etiquetas.push(eti);
      }
    }
   
    let botonCrear=SqS('[type="submit"]',{from:gEt(this.#formID)});

    botonCrear.before(createElement(
          ['SELECT',{
            dataset:{
              type:'tags'
              ,placeholder:'Etiquetas'
              ,selectable:"false"
            }
            ,name:'etiquetasIDs'
            ,multiple:true
            ,required:true
            ,children:etiquetas.map(({ID,descripcion,categoria:{categoriaID,descripcion:categoriaDescripcion}})=>['OPTION',{
              value:ID
              ,innerText:`${categoriaDescripcion} - ${descripcion}`
            }])
          }]
    ));

    BulmaTagsInput.attach();
  
  } catch (error) {
    console.error('Error al inicializar la lista de etiquetas:', error);
  }
}



  async render() {
    return ''
  }
}

export  { ListaEtiquetas };
