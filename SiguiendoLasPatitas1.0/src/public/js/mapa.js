// MAPA INTERACTIVO
document.addEventListener('DOMContentLoaded', async () => {
    const map = L.map('map').setView([-34.6037, -58.3816], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ICONO SIGUIENDO LAS PATATITAS
    let iconSiguiendoLasPatitas = L.icon({
        iconUrl: '/img/marcadorSiguiendo.png',
        iconSize: [45, 45],
        iconAnchor: [20, 45],
        popupAnchor: [0, -40]
    });

    // Verificamos si hay datos
    if (typeof adoptarMapaData !== 'undefined' && adoptarMapaData.length > 0) {
        for (const adoptar of adoptarMapaData) {
            const direccionCompleta = `${adoptar.ADOPTS_DIRECCION}, ${adoptar.ADOPTS_LOCALIDAD}`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    L.marker([lat, lon], { icon: iconSiguiendoLasPatitas })
                        .addTo(map)
                        .bindPopup(`
                            <div class="card">
                                <div class="card-body">
                                    <h3 class="card-title text-uppercase colorGreen">
                                        ${adoptar.MASCOTAS_NOMBRE}
                                    </h3>
                                    <p>${adoptar.TIPO_NOMBRE} - ${adoptar.RAZA_NOMBRE}
                                        Nacimiento: ${adoptar.MASCOTAS_FNAC}
                                    </p>
                                    <h6 class="card-subtitle mb-2 text-body-secondary">
                                        Fecha de adopcion: ${adoptar.ADOPCION_FECHA}
                                    </h6>
                                    <h6 class="card-subtitle mb-2 text-body-secondary">
                                        Adoptante: ${adoptar.ADOPTS_NOMBRE}
                                    </h6>
                                </div>
                            </div>
                        `);
                }
            } catch (err) {
                console.error('Error al geocodificar:', direccionCompleta, err);
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1s entre requests
        }
    } else {
        console.warn('No se cargaron adoptantes');
    }
});