<template>
    <div class="emergency-request">
      <h1>Emergency Request</h1>
      <map-component></map-component>
    </div>
  </template>
  
  <script>
  import MapComponent from './Map.vue'; // Adjust path as necessary
  
  export default {
    components: {
      MapComponent
    }
  }
  </script>
  
  <style>
  .emergency-request #map {
    height: 500px;
    width: 100%;
  }
  </style>
  