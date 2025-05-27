// MAPA INTERACTIVO
document.addEventListener('DOMContentLoaded', async () => {
    const map = L.map('map').setView([-34.6037, -58.3816], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Verificamos si hay datos
    if (typeof adoptantesData !== 'undefined' && adoptantesData.length > 0) {
        for (const adoptante of adoptantesData) {
            const direccionCompleta = `${adoptante.ADOPTS_DIRECCION}, ${adoptante.ADOPTS_LOCALIDAD}`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    L.marker([lat, lon])
                        .addTo(map)
                        .bindPopup(`
                            <strong>${adoptante.ADOPTS_NOMBRE}</strong><br>
                            ${adoptante.ADOPTS_DIRECCION}<br>
                            ${adoptante.ADOPTS_LOCALIDAD}
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

    //AGREGAR MARCADORES.
    // fetch('/estaciones')
    //     .then(response => response.json())
    //     .then(estacionesMapa => {
    //         estacionesMapa.forEach(estacion => {
    //             const marker = L.marker([estacion.ESTC_LATITUD, estacion.ESTC_LONGITUD], { icon: iconSiguiendoLasPatitas })
    //                 .addTo(map)
    //                 .bindPopup(`
    //                     <div class = "">
    //                         <h4 class= "colorGreen">${estacion.ESTC_NOMBRE}</h4>
    //                         <h6>${estacion.ESTC_DIRECCION}</h6>
    //                         <h6>${estacion.ESTC_LOCALIDAD}</h6>
    //                         <h6>Cantidad de surtidores: ${estacion.cantidad_surtidores}</h6>
    //                         <form action="/reserva/estacion/${estacion.ID_ESTC}"> <button class="btn btn-success">Reservar</button> </form>
    //                     </div>
    //                 `);
    //         });
    //     });
// });
//ICONO SIGUIENDO LAS PATATITAS
    // let iconSiguiendoLasPatitas = L.icon({
    //     iconUrl: '/img/marcadorSiguiendo.png',
    //     iconSize: [60, 60],
    //     iconAnchor: [25, 60]
    // });