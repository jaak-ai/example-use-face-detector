async function getVideoDevices() {
	try {
		// Solicita acceso a los dispositivos multimedia
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		const devices = await navigator.mediaDevices.enumerateDevices();

		// Filtra solo los dispositivos de video
		const videoDevices = devices.filter((device) => device.kind === 'videoinput');

		const videoSelect = document.getElementById('videoSelect');

		// Llena el selector con las cámaras disponibles
		videoDevices.forEach((device) => {
			const option = document.createElement('option');
			option.value = device.deviceId;
			option.text = device.label || `Camera ${videoSelect.length + 1}`;
			videoSelect.appendChild(option);
		});

		// Cambiar la fuente del video al seleccionar un dispositivo
		videoSelect.onchange = async () => {
			console.log('Selected device:', videoSelect.value);
			const selectedDeviceId = videoSelect.value;
			let faceDetector = document.querySelector('face-detector');
			if (faceDetector) {
				console.log('Removing existing face detector');
				faceDetector.stopVideoStream();
				faceDetector.stopComponent();
				document.body.removeChild(faceDetector);
				faceDetector = null;
			}

			faceDetector = document.createElement('face-detector');
			faceDetector.config = {
				mode: 'video-camera',
				progressiveAutoRecorder: true,
				video: {
					deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
				},
				validateCamera: true,
			};
			document.body.appendChild(faceDetector);

			faceDetector.addEventListener('fileResult', (event) => {
				console.log('FileResult:', event.detail);
			});

			const switchBtn = document.getElementById('switch-btn');
			const photoBtn = document.getElementById('photo-btn');
			const videoBtn = document.getElementById('video-btn');

			const stopBtn = document.getElementById('stop-btn');

			const statusBox = document.getElementById('render-status');

			switchBtn.addEventListener('click', async () => {
				const mode = await faceDetector.getMode();
				if (mode !== 'video-camera') {
					faceDetector.switchMode('video-camera');
					switchBtn.textContent = 'Subir Archivo';
					photoBtn.style.display = 'inline-block';
					videoBtn.style.display = 'inline-block';
					return;
				}
				faceDetector.switchMode('upload-file');
				switchBtn.textContent = 'Tomar Foto';
				photoBtn.style.display = 'none';
				videoBtn.style.display = 'none';
			});

			photoBtn.addEventListener('click', async () => {
				await faceDetector.takeSnapshot();
			});

			videoBtn.addEventListener('click', async () => {
				await faceDetector.recordVideo();
			});

			faceDetector.addEventListener('status', (event) => {
				statusBox.textContent = event.detail;
			});

			stopBtn.addEventListener('click', async () => {
				await faceDetector.stopComponent();
			});
		};

		// Reproducir el video del primer dispositivo por defecto
		if (videoDevices.length > 0) {
			videoSelect.value = videoDevices[0].deviceId;
			videoSelect.dispatchEvent(new Event('change'));
		}
	} catch (error) {
		console.error('Error accessing video devices:', error);
	}
}

// Llamar a la función al cargar la página
window.onload = getVideoDevices;
