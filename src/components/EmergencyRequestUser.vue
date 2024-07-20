<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-6 offset-lg-3">
                <h2>Emergency Request User</h2>
                <div id="app">
                    <div id="map" class="map-container"></div>
                    <div class="row request">
                        <div class="col-8 dropdown">
                            <label for="problemType">Choose your problem type:</label>
                            <select v-model="problemType" name="problemType" id="dropdown-select" required>
                                <option value="Health problem">Health problem</option>
                                <option value="Security problem">Security problem</option>
                                <option value="Fire">Fire</option>
                            </select>
                            <textarea v-model="description" placeholder="Describe your problem" required></textarea>
                        </div>
                        <div class="col-4 button-container">
                            <button v-if="!requestStatus" @click="startRequest" class="map-button">Start Request</button>
                            <button v-if="requestStatus" @click="stopRequest" class="map-button">Stop Request</button>
                        </div>
                    </div>
                    <div id="coordinatesDisplay" class="coordinates-display"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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
            db: getFirestore(),
            problemType: 'Health problem',
            description: '',
            requestStatus: false,
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

            const bounds = [[0, 0], [634, 634]];
            this.map.fitBounds(bounds);

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

        addMarkerFromGps(lat, lon, user, problemType, description) {
            const svgCoordinates = this.transformToSvg(lat, lon);
            const popupContent = this.createPopupContent({ lat: svgCoordinates[0], lng: svgCoordinates[1] }, [lat, lon], user, problemType, description);
            const marker = L.marker(svgCoordinates).addTo(this.map).bindPopup(popupContent);
            this.markers.push(marker);
        },

        createPopupContent(markerCoordinates, gpsCoordinates, user, problemType, description) {
            const gpsLat = gpsCoordinates[0].toFixed(6);
            const gpsLng = gpsCoordinates[1].toFixed(6);
            return `
                <b>Name:</b> ${user.name} <br>
                <b>Problem Type:</b> ${problemType} <br>
                <b>Description:</b> ${description} <br>
                <b>SVG Coordinates:</b> ${markerCoordinates.lat.toFixed(2)}, ${markerCoordinates.lng.toFixed(2)}<br>
                <b>GPS Coordinates:</b> ${gpsLat}, ${gpsLng}
            `;
        },

        clearMarkers() {
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.markers = [];
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

        async sendEmergencyRequest(gpsLat, gpsLon, user, displayStatus, problemType, description) {
            await updateDoc(doc(this.db, "user-location", user.ID), {
                name: user.name,
                lat: gpsLat,
                lon: gpsLon,
                display: displayStatus,
                problemType: problemType,
                description: description
            });
        },

        startRequest() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        // add marker to map
                        this.addMarkerFromGps(latitude, longitude, this.userInfo, this.problemType, this.description);

                        // lock select until stop the request
                        document.getElementById("dropdown-select").disabled = true;

                        // activate displayStatus and send gps location to the database
                        this.sendEmergencyRequest(latitude, longitude, this.userInfo, true, this.problemType, this.description);

                        // show gps location in the page
                        document.getElementById('coordinatesDisplay').innerHTML = `
                            <b>Name:</b> ${this.userInfo.name} <br>
                            <b>Problem Type:</b> ${this.problemType} <br>
                            <b>GPS Coordinates:</b> ${latitude}, ${longitude}
                        `;

                        // change the requestStatus to true
                        this.requestStatus = true;
                    },
                    error => {
                        console.error("Error getting location", error.message);
                    },
                    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
            }
        },

        stopRequest() {
            // clear marker on map
            this.clearMarkers();

            // deactivate displayStatus in the database
            this.sendEmergencyRequest(0, 0, this.userInfo, false, this.problemType, this.description);

            // unlock select
            document.getElementById("dropdown-select").disabled = false;

            // hide gps location in the page
            document.getElementById('coordinatesDisplay').innerHTML = ``;

            // change the requestStatus to false
            this.requestStatus = false;
        }
    },
};
</script>

<style scoped>
.container-fluid {
    margin-top: 200px;
    width: 100%;
    text-align: center;
    overflow: visible;
    margin-bottom: 20%;
}

@media only screen and (min-width: 600px) {
    .container-fluid {
        margin-top: 70px;
        margin-bottom: 5%;
    }

    .container-fluid h2 {
        padding-top: 50px;
    }
}

#app {
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

.dropdown {
    align-content: center;
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

textarea {
    width: 100%;
    height: 100px;
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>
