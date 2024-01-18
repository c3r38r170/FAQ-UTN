// TODO Refactor: Unificar configuracion de paginacion; como cantidad por pagina
class Tabla{
	// Las tablas siempre serán de entidades
	// Específicamente: usuarios, posts (moderación), etiquetas...
	static instancias={};

	#columnas=[]; //{nombre,celda(entidad)}
	#entidades=[];
	#endpointPaginacion='';
	#pagina=1;
	cantidadDePaginas;
	#id='';

 	constructor(id,endpoint,columnas,entidades=[],cantidadDePaginas=1){
		this.#id=id;
		this.#endpointPaginacion=endpoint;
		this.#columnas=columnas;
		this.#entidades=entidades;
		this.cantidadDePaginas=cantidadDePaginas

		Tabla.instancias[id]=this;
	}

	navegar(e){
		e.preventDefault();
		let form=e.target;
		let fieldset=form.firstElementChild;
		fieldset.disabled=true;
		this.#pagina+=(+e.submitter.value);
		// TODO Feature: Ver si tiene o no ?, y entonces poner ? o &. Quizá hacerlo en el constructor y tener algo como un this.#parametroPagina
		let url=this.#endpointPaginacion+`?pagina=${this.#pagina-1}`;

		fetch(url,{
			credentials:'include',
			method:'GET'
		})
			.then(res=>res.json())
		/* new Promise((resolve, reject)=>{
			resolve(new Array(3).fill(null).map((n,i)=>(3*(this.#pagina-1)+i)));
		}) */
			.then((nuevasEntidades)=>{
				this.#entidades=nuevasEntidades;
				
				let tabla=form.closest('table');
				tabla.children[1] // body
					.innerHTML=this.generarCuerpo();

				fieldset.innerHTML=this.generarElementosPaginacion();
			})
			// TODO Feature: catch
			.finally(()=>{
				fieldset.disabled=false;
			})
	}

	generarCuerpo(){
		let html='';
		for(let ent of this.#entidades){
			html+='<tr>';
			for(let col of this.#columnas){
				html+='<td>'+col.celda(ent)+'</td>'
			}
			html+='</tr>';
		}

		return html;
	}

	generarElementosPaginacion(){
		return`<input class="fa fa-arrow-left" name=accion value=-1 type=submit `+(this.#pagina==1?' disabled':'')+`>
		<span>${this.#pagina} / ${this.cantidadDePaginas}</span>
		<input class="fa fa-arrow-right" name=accion value=1 type=submit `+(this.#pagina==this.cantidadDePaginas?' disabled':'')+`>`;
	}

	render(){
		// TODO UX: CSS de esto
		let html=`<table id=${this.#id}><thead><tr>`;

		for(let col of this.#columnas){
			html+='<th>'+col.nombre+'</th>';
		}

		html+='</tr></thead><tbody>';

		html+=this.generarCuerpo();

		// TODO UX: Hacer lindo esto.
		html+=`</tbody><tfoot><tr><td colspan="${this.#columnas.length}">
	<form onsubmit="Tabla.instancias['${this.#id}'].navegar(event)">
		<fieldset>
			${this.generarElementosPaginacion()}
		</fieldset>
	</form>
</td></tr></tfoot></table>`;

		return html;
	}
}