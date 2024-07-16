<template>
    <div id="app">
      <div id="map" class="map-container"></div>
      <div class="button-container">
        <button @click="clearMarkers" class="map-button">Clear Markers</button>
        <button @click="addTestMarker" class="map-button">Add Test Marker</button>
      </div>
    </div>
  </template>
  
  <script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import _ from 'lodash';
  
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

  
  export default {
    name: 'MapComponent',
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
      };
    },
    mounted() {
      this.initMap();
      this.loadMarkers();
      this.getGeolocation();
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
  
        const bounds = [[0, 0], [1000, 1000]];
        this.map.fitBounds(bounds);
        L.control.scale().addTo(this.map);
        this.map.on('click', this.addMarker);
      },
      loadRasterizedSvg() {
        fetch('/public/mapconvert.html')
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const svgElement = doc.querySelector('svg');
            if (!svgElement) {
              throw new Error("SVG element not found.");
            }
            const svgBounds = [[0, 0], [svgElement.viewBox.baseVal.width, svgElement.viewBox.baseVal.height]];
            const imageUrl = this.rasterizeSvgToUrl(svgElement);
            L.imageOverlay(imageUrl, svgBounds).addTo(this.map);
          })
          .catch(error => {
            console.error('Error loading SVG overlay:', error);
          });
      },
      rasterizeSvgToUrl(svgElement) {
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.viewBox.baseVal.width;
        canvas.height = svgElement.viewBox.baseVal.height;
        const ctx = canvas.getContext('2d');
        const svgAsXML = (new XMLSerializer()).serializeToString(svgElement);
        const dataUrl = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          return canvas.toDataURL('image/png');
        };
        img.src = dataUrl;
      },
      getGeolocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const coordinates = [position.coords.latitude, position.coords.longitude];
            this.map.setView(coordinates, 13);
            this.addMarker({latlng: L.latLng(coordinates[0], coordinates[1])});
          }, error => {
            console.error("Geolocation error:", error);
          });
        }
      },
      addMarker(event) {
        const marker = L.marker(event.latlng).addTo(this.map);
        this.markers.push(marker);
      },
      clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        localStorage.setItem('markers', JSON.stringify([]));  // Clear stored markers
      },
      addTestMarker() {
        const testLocation = { lat: 11.106563, lng: 106.612568 };  // Sample location
        const marker = L.marker([testLocation.lat, testLocation.lng]).addTo(this.map);
        marker.bindPopup("Test Marker at Sample Location");
        this.markers.push(marker);
      }
    }
  }
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
  </style>
  