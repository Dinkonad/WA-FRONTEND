export function tipIkona(tip) {
  const ikone = { Run: '🏃', Ride: '🚴', Walk: '🚶', Hike: '🥾', Swim: '🏊', Workout: '💪' };
  return ikone[tip] || '⚡';
}

export function formatirajDatum(datum) {
  return new Date(datum).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatirajDatumPuni(datum) {
  return new Date(datum).toLocaleDateString('hr-HR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatirajVrijeme(sekunde) {
  const h = Math.floor(sekunde / 3600);
  const m = Math.floor((sekunde % 3600) / 60);
  const s = sekunde % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function dekodirajPolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export function ucitajSkriptu(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve;
    document.head.appendChild(s);
  });
}

export async function ucitajLeaflet() {
  if (!window.L) {
    await ucitajSkriptu('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

export function inicijalizirajKartu(elId, polyline) {
  const el = document.getElementById(elId);
  if (!el || !window.L) return;

  if (el._leaflet_id) {
    try { window.L.map(el).remove(); } catch (e) {}
    el._leaflet_id = null;
    el.innerHTML = '';
  }

  const karta = window.L.map(el, { zoomControl: true, attributionControl: false });
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, crossOrigin: true }).addTo(karta);
  const latlngs = dekodirajPolyline(polyline);
  window.L.polyline(latlngs, { color: '#f5c800', weight: 4, opacity: 0.9 }).addTo(karta);
  karta.fitBounds(window.L.polyline(latlngs).getBounds(), { padding: [20, 20] });
  return karta;
}
