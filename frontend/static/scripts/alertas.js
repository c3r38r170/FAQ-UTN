let CustomSwal=Swal.mixin({
	customClass:{
		confirmButton:'button is-link is-rounded mt-3'
	}
});

Swal.error=function(mensaje){
	return CustomSwal.fire({
		text:mensaje,
		icon:'error'
	})
}