<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-6 offset-lg-3">
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
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
<div>
    
</div>
</template>
  
<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import _ from 'lodash';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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
    created(){
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
        this.loadMarkers();
        this.fetchRequests();
    },
    methods: {
        initMap() {
            this.map = L.map('map', {
                crs: L.CRS.Simple,
                minZoom: -1,
                maxZoom: 4,
                zoomSnap: 0.1,
                zoomDelta: 0.1,
            });

            if (this.map) {
                const bounds = [[0, 0], [634, 634]];
                this.map.fitBounds(bounds);

                L.control.scale({ position: 'bottomright' }).addTo(this.map);
                L.control.scale({ position: 'bottomleft', maxWidth: 100, metric: true, imperial: false }).addTo(this.map);

                this.map.on('click', this.addMarker);
            } else {
                console.error('Map object is undefined. Initialization failed.');
            }
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

                    // Create an offscreen canvas to rasterize the SVG
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

        addMarker(event) {
            const markerCoordinates = event.latlng;
            const gpsCoordinates = this.transformToGps(markerCoordinates.lat, markerCoordinates.lng);
            const popupContent = this.createPopupContent(markerCoordinates, gpsCoordinates);
            const marker = L.marker(markerCoordinates).addTo(this.map).bindPopup(popupContent);
            this.markers.push(marker);
            this.debouncedSaveMarkers();
        },

        addMarkerFromGps(lat, lon, user, problemType) {
            const svgCoordinates = this.transformToSvg(lat, lon);
            console.log('start:',svgCoordinates);
            const popupContent = this.createPopupContent({ lat: svgCoordinates[0], lng: svgCoordinates[1] }, [lat, lon], user, problemType);
            const marker = L.marker(svgCoordinates).addTo(this.map).bindPopup(popupContent);
            this.markers.push(marker);
        },

        createPopupContent(markerCoordinates, gpsCoordinates, user, problemType) {
            const gpsLat = gpsCoordinates[0].toFixed(6);
            const gpsLng = gpsCoordinates[1].toFixed(6);
            return `
                <b>Name:</b> ${user.name} <br>
                <b> Problem Type:</b> ${problemType} <br>
                <b>SVG Coordinates:</b> ${markerCoordinates.lat.toFixed(2)}, ${markerCoordinates.lng.toFixed(2)}<br>
                <b>GPS Coordinates:</b> ${gpsLat}, ${gpsLng} 
            `;
        },

        debouncedSaveMarkers: _.debounce(function() {
            this.saveMarkers();
        }, 500),

        saveMarkers() {
            const markerData = this.markers.map(marker => ({
                lat: marker.getLatLng().lat,
                lng: marker.getLatLng().lng,
                popup: marker.getPopup().getContent()
            }));
            localStorage.setItem('markers', JSON.stringify(markerData));
        },

        loadMarkers() {
            const markerData = JSON.parse(localStorage.getItem('markers'));
            if (markerData) {
                markerData.forEach(data => {
                    const marker = L.marker([data.lat, data.lng]).addTo(this.map).bindPopup(data.popup);
                    this.markers.push(marker);
                });
            }
        },

        clearMarkers() {
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = [];
            this.saveMarkers();
        },

        transformToSvg(lat, lon) {
            const { knownPoints } = this;
            const [p1, p2, p3, p4] = knownPoints;

            const x = this.bilinearInterpolation(
                p1.gps[0], p2.gps[0], p3.gps[0], p4.gps[0],
                p1.svg[0], p2.svg[0], p3.svg[0], p4.svg[0],
                lat, lon
            );

            const y = this.bilinearInterpolation(
                p1.gps[1], p2.gps[1], p3.gps[1], p4.gps[1],
                p1.svg[1], p2.svg[1], p3.svg[1], p4.svg[1],
                lat, lon
            );

            return [x, y];
        },

        transformToGps(x, y) {
            const { knownPoints } = this;
            const [p1, p2, p3, p4] = knownPoints;

            const lat = this.bilinearInterpolation(
                p1.svg[0], p2.svg[0], p3.svg[0], p4.svg[0],
                p1.gps[0], p2.gps[0], p3.gps[0], p4.gps[0],
                x, y
            );

            const lon = this.bilinearInterpolation(
                p1.svg[1], p2.svg[1], p3.svg[1], p4.svg[1],
                p1.gps[1], p2.gps[1], p3.gps[1], p4.gps[1],
                x, y
            );

            return [lat, lon];
        },

        bilinearInterpolation(x1, x2, x3, x4, y1, y2, y3, y4, x, y) {
            const deltaX1 = x2 - x1;
            const deltaX2 = x3 - x1;
            const deltaY1 = y2 - y1;
            const deltaY2 = y3 - y1;

            if (deltaX1 === 0 || deltaX2 === 0) {
                console.error('Invalid known points, leading to division by zero');
                return NaN;
            }

            const a0 = y1;
            const a1 = deltaY1 / deltaX1;
            const a2 = deltaY2 / deltaX2;
            const a3 = (y1 - y2 - y3 + y4) / (deltaX1 * deltaX2);

            return a0 + a1 * (x - x1) + a2 * (y - x1) + a3 * (x - x1) * (y - x1);
        },

        async fetchRequests() {
            try {
                const querySnapshot = await getDocs(collection(this.db, 'user-location'));
                this.requests = querySnapshot.docs
                this.requests = this.requests.filter(request => request.data().display == true);

                this.requests.forEach((request) => {
                    console.log('add marker:',request.data().name);
                    this.addMarkerFromGps(request.data().lat,request.data().lon,request.data().name,request.data().problemType)
                })
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
    },
};
</script>

<style scoped>
    .container-fluid{
        margin-top: 200px;
        width: 100%;
        text-align: center;
        overflow: visible;
        margin-bottom: 20%;
    }
    @media only screen and (min-width: 600px) {
        .container-fluid{
            margin-top: 70px;
            margin-bottom: 5%;
        }
        .container-fluid h2{
            padding-top: 50px;
        }
    }
    #app{
        margin-top: 20px;
    }
    #map {
        height: 500px;
        width: 100%;
        border: 2px solid #ddd;
        border-radius: 8px;
        margin-bottom: 20px;
        z-index: -1;
    }
    
    .button-container {
        display: flex;
        gap: 10px;
    }
    
    .map-button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    
    .map-button:hover {
        background-color: #0056b3;
    }
    
    .coordinates-display {
        margin-top: 20px;
        font-size: 16px;
        color: #333;
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin-top: 20px;
        text-align: left;
    }

    li {
        background-color: #f9f9f9;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
    }
    li p{
        margin-left: 20px;
    }
    .title{
        font-size: 20px;
    }
</style>
  