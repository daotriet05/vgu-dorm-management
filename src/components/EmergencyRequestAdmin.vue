<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-8 offset-lg-2">
                <h2>Emergency Requests Admin</h2>
                <div id="app">
                    <div id="map" class="map-container"></div>
                </div>
                <ul class="table-user">
                    <li v-for="request in requests" :key="request.id">
                        <div class="row">
                            <div class="col">
                                <p><span class="title">Problem Type: {{ request.data().problemType }}</span></p>
                                <p>Name: {{ request.data().name }}</p>
                                <p>Latitude: {{ request.data().lat }}, Longitude: {{ request.data().lon }}</p>
                                <p>Description: {{ request.data().description }}</p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default {
    props: ['loggedStatus', 'userInfo'],
    data() {
        return {
            map: null,
            markers: [],
            knownPoints: [
                { svg: [0, 0], gps: [11.106563, 106.612568] },
                { svg: [1000, 0], gps: [11.106751, 106.613055] },
                { svg: [1000, 1000], gps: [11.106231, 106.613248] },
                { svg: [0, 1000], gps: [11.106055, 106.612760] },
            ],
            requests: [],
            db: getFirestore(),
        };
    },
    created() {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'marker-icon.png',
            iconUrl: 'marker-icon.png',
            shadowUrl: 'marker-shadow.png',
        });
    },
    mounted() {
        this.initMap();
        this.loadRasterizedSvg();
        this.fetchRequests();
        setInterval(() => {
            this.fetchRequests();
        }, 3000);
    },
    methods: {
        initMap() {
            this.map = L.map('map', {
                crs: L.CRS.Simple,
                minZoom: -1,
                maxZoom: 4,
                zoomSnap: 0.1,
                zoomDelta: 0.1,
                maxBoundsViscosity: 1.0,
            });

            const bounds = [[0, 0], [700, 700]];
            this.map.setMaxBounds(bounds);
            this.map.fitBounds(bounds);
            this.map.setView([350, 350], 1);

            L.control.scale({ position: 'bottomright' }).addTo(this.map);
            L.control.scale({ position: 'bottomleft', maxWidth: 100, metric: true, imperial: false }).addTo(this.map);
        },

        loadRasterizedSvg() {
            fetch('/mapconvert.html')
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const svgElement = doc.querySelector('svg');

                    if (svgElement) {
                        console.log('SVG Element:', svgElement);
                        const svgBounds = [[0, 0], [svgElement.height.baseVal.value, svgElement.width.baseVal.value]];

                        const canvas = document.createElement('canvas');
                        canvas.width = svgElement.width.baseVal.value;
                        canvas.height = svgElement.height.baseVal.value;
                        const ctx = canvas.getContext('2d');

                        const svgString = new XMLSerializer().serializeToString(svgElement);
                        const img = new Image();
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgString);

                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            const pngUrl = canvas.toDataURL('image/png');
                            const imageOverlay = L.imageOverlay(pngUrl, svgBounds).addTo(this.map);

                            if (imageOverlay) {
                                console.log('Rasterized SVG overlay added successfully');
                                this.map.fitBounds(svgBounds);
                            } else {
                                console.error('Failed to add rasterized SVG overlay');
                            }
                        };

                        img.onerror = () => {
                            console.error('Failed to load rasterized SVG image');
                        };
                    } else {
                        console.error('SVG element not found in HTML');
                    }
                })
                .catch(error => {
                    console.error('Error loading SVG overlay:', error);
                });
        },

        addMarkerFromGps(lat, lon, name, problemType, description) {
            console.log(`Adding marker for: ${name}, Lat: ${lat}, Lon: ${lon}`);
            const svgCoordinates = this.transformToSvg(lat, lon);
            console.log(`SVG Coordinates: ${svgCoordinates}`);
            if (svgCoordinates[0] >= 0 && svgCoordinates[0] <= 700 && svgCoordinates[1] >= 0 && svgCoordinates[1] <= 700) {
                const popupContent = this.createPopupContent({ lat: svgCoordinates[0], lng: svgCoordinates[1] }, [lat, lon], name, problemType, description);
                const marker = L.marker(svgCoordinates).addTo(this.map).bindPopup(popupContent).openPopup();
                this.markers.push(marker);
            } else {
                //alert('You are out of VGU dorm area. Please enter to start request');
                console.error('Coordinates out of bounds:', svgCoordinates);
            }
        },

        createPopupContent(markerCoordinates, gpsCoordinates, name, problemType, description) {
            const gpsLat = gpsCoordinates[0].toFixed(6);
            const gpsLng = gpsCoordinates[1].toFixed(6);
            return `
                <b>Name:</b> ${name} <br>
                <b>Problem Type:</b> ${problemType} <br>
                <b>Description:</b> ${description} <br>
                <b>SVG Coordinates:</b> ${markerCoordinates.lat.toFixed(2)}, ${markerCoordinates.lng.toFixed(2)}<br>
                <b>GPS Coordinates:</b> ${gpsLat}, ${gpsLng}
            `;
        },

        transformToSvg(lat, lon) {
            const { knownPoints } = this;

            const svgWidth = 700;
            const svgHeight = 700;
            const gpsTopLeft = knownPoints[0].gps;
            const gpsBottomRight = knownPoints[2].gps;

            const xScale = svgWidth / (gpsBottomRight[1] - gpsTopLeft[1]);
            const yScale = svgHeight / (gpsTopLeft[0] - gpsBottomRight[0]);

            const x = (lon - gpsTopLeft[1]) * xScale;
            const y = (gpsTopLeft[0] - lat) * yScale;

            console.log(`Transform to SVG: Lat: ${lat}, Lon: ${lon}, X: ${x}, Y: ${y}`);
            return [x, y];
        },
        clearMarkers() {
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = [];
        },
        async fetchRequests() {
            this.clearMarkers();
            try {
                const querySnapshot = await getDocs(collection(this.db, 'user-location'));
                this.requests = querySnapshot.docs;
                this.requests = this.requests.filter(request => request.data().display === true);

                this.requests.forEach((request) => {
                    this.addMarkerFromGps(request.data().lat, request.data().lon, request.data().name, request.data().problemType, request.data().description);
                });
            } catch (error) {
                console.error('Error fetching requests:', error);
            }
        }
    }
};
</script>

<style>
.container-fluid {
    padding: 20px;
}
.map-container {
    height: 700px;
}
.table-user {
    list-style: none;
    padding: 0;
}
.table-user li {
    margin-bottom: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    z-index: -1;

    
}
.title {
    font-weight: bold;
}
</style>
