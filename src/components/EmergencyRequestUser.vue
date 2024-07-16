<template>
    <div>
      <p>Emergency Request User</p>
      <p>{{ userInfo.name }}</p>
      <!-- Include the MapComponent, assuming userInfo includes 'location' with 'lat' and 'lng' -->
      <map-component :locations="[{lat: userInfo.location.lat, lng: userInfo.location.lng}]"></map-component>
    </div>
  </template>
  
  <script>
  import MapComponent from './Map.vue'; // Ensure this path is correct
  
  export default {
    components: {
      MapComponent
    },
    props: ['loggedStatus', 'userInfo']
  }
  </script>
  
  <style>
  /* Style as necessary */
  </style>
  