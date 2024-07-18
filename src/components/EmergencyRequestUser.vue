<template>
  <div>
    <h2>Emergency Request User</h2>
    <div id="app">
        <div id="map" class="map-container"></div>
        <div class="button-container">
            <!-- <button @click="getCoordinates" class="map-button">Get Coordinates</button> -->
            <button v-if="!requestStatus" @click="startRequest" class="map-button">start</button>
            <button v-if="requestStatus" @click="stopRequest" class="map-button">stop</button>
            <!-- <button @click="addTestMarker" class="map-button">add test</button>
            <button @click="clearMarkers" class="map-button">clear</button> -->
        </div>
        <div class="dropdown">
            <label for="problemType">Choose your problem type:</label>
            <select v-model="problemType" name="problemType" id="dropdown-select" required>
                <option value="Health problem">Health problem</option>
                <option value="Security problem">Security problem</option>
                <option value="Fire">Fire</option>
            </select>
        </div>
        <div id="coordinatesDisplay" class="coordinates-display"></div>
    </div>
  </div>
</template>

<script>
//import EventBus from '../utils/Events.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import _ from 'lodash';
import { getFirestore, collection, addDoc, updateDoc, doc } from 'firebase/firestore';

// Set the default icon paths


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
            requestStatus: false,
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

        addTestMarker() {
            const testSvgCoordinates = [500, 500];
            console.log('svg debug:',testSvgCoordinates);
            const gpsCoordinates = this.transformToGps(testSvgCoordinates[0], testSvgCoordinates[1]);
            console.log('gps debug:',gpsCoordinates);
            const popupContent = this.createPopupContent({ lat: testSvgCoordinates[0], lng: testSvgCoordinates[1] }, gpsCoordinates, this.userInfo, this.problemType);
            const marker = L.marker(testSvgCoordinates).addTo(this.map).bindPopup(popupContent);
            this.markers.push(marker);
        },

        // getCoordinates() {
        //     if(navigator.geolocation) {
        //         navigator.geolocation.getCurrentPosition(              //watchPos: tracking the position whenever the device location changes
        //             position => {
        //                 const latitude = position.coords.latitude;
        //                 const longitude = position.coords.longitude;
        //                 console.log(`Get gps coordinate = Latitude: ${latitude}, Longitude: ${longitude}`);
        //                 const testSvg=this.transformToSvg(latitude,longitude)
        //                 console.log(`Get svg coordinate = Latitude: ${testSvg[0]}, Longitude: ${testSvg[1]}`);
        //                 document.getElementById('coordinatesDisplay').innerHTML = `
        //                     <b>Name:</b> ${user.name} <br>
        //                     <b> Problem Type:</b> ${problemType} <br>
        //                     <b>SVG Coordinates:</b> ${markerCoordinates.lat.toFixed(2)}, ${markerCoordinates.lng.toFixed(2)}<br>
        //                     <b>GPS Coordinates:</b> ${gpsLat}, ${gpsLng} 
        //                 `;
        //             },
        //             error => {
        //                 console.error("Error getting location", error.message);
        //             },
        //             {enableHighAccuracy: true, maximumAge: 0, timeout: 5000}
        //         );
        //     } else {
        //         console.error("Geolocation is not supported by this browser.");
        //     }
        // },
        async sendEmergencyRequest(gpsLat,gpsLon,user,displayStatus, problemType){
            await updateDoc(doc(this.db, "user-location",user.ID),{
                name: user.name,
                lat: gpsLat,
                lon: gpsLon,
                display: displayStatus,
                problemType: problemType
            })
        },
        startRequest(){
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(              //watchPos: tracking the position whenever the device location changes
                    position => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        // add marker to map
                        this.addMarkerFromGps(latitude,longitude, this.userInfo, this.problemType)

                        // lock select until stop the request
                        document.getElementById("dropdown-select").disabled = true;

                        // activate displayStatus and send gps location to the database
                        this.sendEmergencyRequest(latitude,longitude,this.userInfo,true, this.problemType)

                        // show gps location in the page
                        document.getElementById('coordinatesDisplay').innerHTML = `
                            <b>Name:</b> ${this.userInfo.name} <br>
                            <b> Problem Type:</b> ${this.problemType} <br>
                            <b>GPS Coordinates:</b> ${latitude}, ${longitude} 
                        `;

                        // change the requestStatus to true
                        this.requestStatus=true
                    },
                    error => {
                        console.error("Error getting location", error.message);
                    },
                    {enableHighAccuracy: true, maximumAge: 0, timeout: 5000}
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
            }
        },
        stopRequest(){
            // clear marker on map
            this.clearMarkers()

            // deactivate displayStatus in the database
            this.sendEmergencyRequest(0,0,this.userInfo,false,this.problemType)

            // unlock select
            document.getElementById("dropdown-select").disabled = false;

            // hide gps location in the page
            document.getElementById('coordinatesDisplay').innerHTML = ``;

            // change the requestStatus to false
            this.requestStatus=false
        }
    },
};
</script>

<style>
    #map {
        height: 500px;
        width: 100%;
        border: 2px solid #ddd;
        border-radius: 8px;
        margin-bottom: 20px;
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
</style>
