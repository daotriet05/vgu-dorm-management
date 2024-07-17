<template>
    <div class="emergency-request-admin">
      <h1>Emergency Request Admin</h1>
      <p>{{ userInfo.name }}</p>
    </div>
  </template>
  
  <script>
  
  export default {
    
    props: ['loggedStatus', 'userInfo']
  }
  </script>
  
  <style>
  .emergency-request-admin #map {
    height: 500px;
    width: 100%;
  }
  </style>
  