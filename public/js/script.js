const socket = io();

if(navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const {latitude, longitude} = position.coords;
        socket.emit("send-location", {latitude, longitude});
        
        // Set view only on first location update
        if(!map._located) {
            map.setView([latitude, longitude], 16);
            map._located = true;
        }
    }, (error) => {
        console.error(error);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    })
};

const map = L.map("map").setView([0,0], 16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const {id, latitude, longitude} = data;

    if(markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User: ${id}`);  // shows ID on click
    }

    const allMarkers = Object.values(markers);
    if(allMarkers.length > 1) {
        const group = L.featureGroup(allMarkers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
})

socket.on("user-disconnected", (id) => {
    if(markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})