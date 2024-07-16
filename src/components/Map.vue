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
  
  // Set the default icon paths
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
  
        const bounds = [[0, 0], [634, 634]];
        this.map.fitBounds(bounds);
  
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
  
        L.control.scale().addTo(this.map);
        this.map.on('click', this.addMarker);
      },
      loadRasterizedSvg() {
        fetch('/mapconvert.html')
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const svgElement = doc.querySelector('svg');
            if (!svgElement) throw new Error("SVG element not found.");
  
            const bounds = [[0, 0], [svgElement.viewBox.baseVal.width, svgElement.viewBox.baseVal.height]];
            const imageUrl = this.rasterizeSvgToUrl(svgElement);
            L.imageOverlay(imageUrl, bounds).addTo(this.map);
            console.log('SVG Element:', svgElement);
            console.log('Rasterized SVG overlay added');
          })
          .catch(error => console.error('Error loading SVG overlay:', error));
      },
      rasterizeSvgToUrl(svgElement) {
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.viewBox.baseVal.width;
        canvas.height = svgElement.viewBox.baseVal.height;
        const ctx = canvas.getContext('2d');
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svgElement));
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
      },
      getGeolocation() {
        navigator.geolocation.getCurrentPosition(position => {
          const coordinates = this.transformToSvg(position.coords.latitude, position.coords.longitude);
          this.map.setView(coordinates, 13);
          console.log('Geolocation obtained:', coordinates);
        }, error => console.error(error));
      },
      addMarker(event) {
        const marker = L.marker(event.latlng).addTo(this.map);
        this.markers.push(marker);
      },
      clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
      },
      addTestMarker() {
        const testMarker = L.marker([500, 500]).addTo(this.map);
        this.markers.push(testMarker);
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
        const a0 = y1;
        const a1 = (y2 - y1) / (x2 - x1);
        const a2 = (y3 - y1) / (x3 - x1);
        const a3 = (y1 - y2 - y3 + y4) / ((x2 - x1) * (x3 - x1));
  
        return a0 + a1 * (x - x1) + a2 * (y - x1) + a3 * (x - x1) * (y - x1);
      },
      loadMarkers() {
        this.addTestMarker(); // Adding a test marker to verify the method
        console.log('Markers loaded');
      },
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
  </style>
  