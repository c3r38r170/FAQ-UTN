import {SqS , ALL , addElement} from '../libs/c3tools.js';
import BulmaTagsInput from 'https://cdn.jsdelivr.net/npm/@creativebulma/bulma-tagsinput@1.0.3/+esm';

function inicializarListas(){

    BulmaTagsInput.attach();
    let filtroDeEtiquetas=SqS('.tags-input.is-filter > input', { n: ALL });
    let ultimaCategoria = null;
    let ultimoColor = null;
    let style = ''


    for(const f of filtroDeEtiquetas ) {
        f.required = false
        f.parentNode.nextElementSibling.style.display = 'block';
        let select = f.parentNode.nextElementSibling;
        for(const o of select.children){
            if(ultimaCategoria != o.dataset.categoria){
                if(ultimoColor){
                    style+=`{background-color:${ultimoColor}}`
                }
                ultimaCategoria = o.dataset.categoria
                ultimoColor = o.dataset.color
                style+=`[data-text^="${ultimaCategoria}"]`
            }
            style+=`, .tag.is-rounded[data-value="${o.value}"]`
        }
        style+=`{background-color:${ultimoColor}}`
    }
    addElement(SqS('head'),['STYLE',{innerHTML:style}]);


    // htmlStyle+=`[data-text^="${cat.descripcion}"]`;
    // htmlStyle+=`, .tag.is-rounded[data-value="${eti.ID}"]`;
    // htmlStyle+=`{background-color:${cat.color}}`;
    // addElement(SqS('head'),['STYLE',{innerHTML:htmlStyle}]);


}

export default inicializarListas;
/* <style>, .tag.is-rounded[data-value="16"], .tag.is-rounded[data-value="15"], .tag.is-rounded[data-value="3"], .tag.is-rounded[data-value="2"], .tag.is-rounded[data-value="14"], .tag.is-rounded[data-value="13"], .tag.is-rounded[data-value="12"], .tag.is-rounded[data-value="11"], .tag.is-rounded[data-value="6"], .tag.is-rounded[data-value="5"], .tag.is-rounded[data-value="4"]{background-color:null}</style> */