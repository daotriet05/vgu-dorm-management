<template>
    <div>
      <p>Emergency Request User</p>
      <p>{{ userInfo.name }}</p>
      <!-- Include the MapComponent, assuming userInfo includes 'location' with 'lat' and 'lng' -->
      <MapComponent :locations="[{lat: userInfo.location.lat, lng: userInfo.location.lng}]" />
    </div>
  </template>
  
  <script>
  import MapComponent from './Map.vue'; // Ensure this path is correct
  
  export default {
    components: {
      MapComponent
    },
    props: ['loggedStatus', 'userInfo'],
    data() {
      return {
        // Data properties if necessary
      };
    },
    methods: {
      // Method definitions if necessary
    }
  }
  </script>
  
  <style>
  /* Style as necessary */
  </style>
  