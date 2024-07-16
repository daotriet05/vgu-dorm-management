<template>
    <div class="emergency-request-admin">
      <h1>Emergency Request Admin</h1>
      <p>{{ userInfo.name }}</p>
      <map-component></map-component>
    </div>
  </template>
  
  <script>
  import MapComponent from './Map.vue'; // Adjust path as necessary
  
  export default {
    components: {
      MapComponent
    },
    props: ['loggedStatus', 'userInfo']
  }
  </script>
  
  <style>
  .emergency-request-admin #map {
    height: 500px;
    width: 100%;
  }
  </style>
  