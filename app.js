document.getElementById('form-vuelos').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const datos = {
    origen: form.origen.value.toUpperCase(),
    destino: form.destino.value.toUpperCase(),
    fecha: form.fecha.value,
    adultos: form.adultos.value,
    clase: form.clase.value,
    escalas: form.escalas.value
  };
  const resultados = document.getElementById('resultados');
  resultados.innerHTML = '<div class="vuelo-card">Buscando vuelos...</div>';
  try {
    const res = await fetch('/api/vuelos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      resultados.innerHTML = '<div class="vuelo-card">No se encontraron vuelos.</div>';
      return;
    }
    resultados.innerHTML = '';
    data.data.forEach(oferta => {
      const itinerario = oferta.itineraries[0];
      const salida = itinerario.segments[0].departure;
      const llegada = itinerario.segments[itinerario.segments.length - 1].arrival;
      const duracion = itinerario.duration.replace('PT', '').toLowerCase();
      const precio = oferta.price.total + ' ' + oferta.price.currency;
      const escalaTxt = itinerario.segments.length === 1 ? 'Directo' : `${itinerario.segments.length - 1} escala(s)`;
      resultados.innerHTML += `
        <div class="vuelo-card">
          <div class="vuelo-header">
            <span>${salida.iataCode} → ${llegada.iataCode}</span>
            <span class="vuelo-precio">${precio}</span>
          </div>
          <div class="vuelo-detalles">
            <b>Salida:</b> ${salida.at.replace('T',' ')}<br>
            <b>Llegada:</b> ${llegada.at.replace('T',' ')}<br>
            <b>Duración:</b> ${duracion}<br>
            <b>Clase:</b> ${oferta.travelerPricings[0].fareDetailsBySegment[0].cabin}<br>
            <b>Escalas:</b> ${escalaTxt}
          </div>
        </div>
      `;
    });
  } catch (err) {
    resultados.innerHTML = `<div class="vuelo-card">Error al buscar vuelos. Intenta de nuevo.</div>`;
  }
});
