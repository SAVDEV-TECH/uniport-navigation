 
  const locations = [
    { id: 1, name: "Faculty of Computing", lat: 4.901, lng: 6.921 },
    { id: 2, name: "Faculty of Law", lat: 4.903, lng: 6.924 },
    { id: 3, name: "Abuja Hostel", lat: 4.904, lng: 6.917 },
    { id: 4, name: "Medical Centre", lat: 4.899, lng: 6.920 },
    { id: 5, name: "Donald Ekong Library", lat: 4.902, lng: 6.922 },
    { id: 6, name: "Ofrima Complex", lat: 4.900, lng: 6.919 },
    { id: 7, name: "Choba Gate", lat: 4.905, lng: 6.915 },
  ];

  const map = L.map('map').setView([4.901, 6.921], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let routeControl = null;

  locations.forEach(loc => {
  const marker = L.marker([loc.lat, loc.lng]).addTo(map);
  marker.on('click', () => {
    if (!navigator.geolocation) {
      showPopup(loc, null);
    } else {
      navigator.geolocation.getCurrentPosition(pos => {
        const dist = getDistanceFromLatLng(pos.coords.latitude, pos.coords.longitude, loc.lat, loc.lng);
        showPopup(loc, dist);
      }, () => {
        showPopup(loc, null);
      });
    }
  });
});

function showPopup(loc, distanceKm) {
  const popupContent = `
    <div style="max-width: 220px;">
      <img src="${loc.image}" alt="${loc.name}" style="width:100%; border-radius:8px; margin-bottom:6px;">
      <strong>${loc.name}</strong><br>
      <span style="font-size: 0.9em; background: #00703C; color: white; padding: 2px 6px; border-radius: 6px;">
        ${loc.type}
      </span><br/>
      ${distanceKm ? `<p style="margin:4px 0;">📏 Distance: ${distanceKm.toFixed(2)} km</p>` : ""}
      <button onclick="getDirections(${loc.lat}, ${loc.lng})">Get Directions</button>
    </div>
  `;
  L.popup()
    .setLatLng([loc.lat, loc.lng])
    .setContent(popupContent)
    .openOn(map);
}


  function flyToLocation(id) {
    const loc = locations.find(l => l.id === id);
    map.flyTo([loc.lat, loc.lng], 18);
  }

  function getDirections(destLat, destLng) {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(position => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      if (routeControl) {
        map.removeControl(routeControl);
      }

      routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(destLat, destLng)
        ],
        routeWhileDragging: false
      }).addTo(map);
    }, () => {
      alert("Could not get your location.");
    });
  }
 
function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

document.getElementById("searchBox").addEventListener("input", function(e) {
  const query = e.target.value.toLowerCase();
  const match = locations.find(loc => loc.name.toLowerCase().includes(query));
  if (match) {
    flyToLocation(match.id);
  }
});
