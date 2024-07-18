  <template>
      <div class="emergency-request">
        <h1>Emergency Request</h1>
        <router-view v-slot="{ Component}">
          <component 
              :is="Component"
              :userInfo="userInfo"
          />
      </router-view>
      </div>
  </template>
    
  <script>

    export default {
      props: ['userInfo']
    }
  </script>
    
  <style>
    .emergency-request {
      overflow: visible;
      margin-bottom: 100px;
    }
    
    .emergency-request #map {
      height: 500px;
      width: 100%;
    }
  </style>
    