let CustomSwal = Swal.mixin({
	customClass: {
		confirmButton: 'button is-link is-rounded mt-3'
	}
});

Swal.error = function (mensaje) {
	return CustomSwal.fire({
		text: mensaje,
		icon: 'error'
	})
}

// TODO Refactor: ¿Quizá agregar un parámetro callback, para que sea reutilizable?
Swal.exito = function (mensaje) {
	return CustomSwal.fire({
		text: mensaje,
		icon: 'success'
	}).then(() => {
		document.getElementById("modal-resetear-contrasenia").classList.remove('is-active');
	});
};

Swal.confirmar=function(text='¿Está seguro? Esta acción no se puede deshacer.') {
	return CustomSwal.fire({
		text
		,icon: "warning"
		,showCancelButton: true
		,customClass: {
			// TODO Refactor: DRY
			confirmButton: 'button is-link is-rounded mt-3',
			cancelButton:'button is-rounded mt-3'
		}
		,confirmButtonText: 'Eliminar definitivamente'
		,cancelButtonText: "Cancelar"
	})
}