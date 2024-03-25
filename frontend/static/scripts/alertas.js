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

Swal.redirigirEn=function(segundos, mensaje){
	let timerInterval;
	return CustomSwal.fire({
		icon: "warning",
		// TODO UX: Mensaje pensando en cuando se redirige (pregunta) o se recarga la pagina (respuestas). Algo como "Se procederá en..."
		html: mensaje+`<br><br>Vas a ser redirigido en <b></b> segundos.`,
		timer: segundos*1000,
		timerProgressBar: true,
		didOpen: () => {
			// Swal.showLoading();
			const timer = Swal.getPopup().querySelector("b");
			timerInterval = setInterval(() => {
				timer.textContent = `${(Swal.getTimerLeft()/1000).toFixed(1)}`;
			}, 200);
		},
		willClose: () => {
			clearInterval(timerInterval);
		}
	});
}