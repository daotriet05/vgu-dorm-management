<template>
  <div>
    <p>Emergency Request User</p>
    <p>{{ userInfo.name }}</p>
    <!-- Include the MapComponent, assuming userInfo includes 'location' with 'lat' and 'lng' -->
  </div>
</template>

<script>
import MapComponent from './Map.vue';
import EventBus from '../utils/Events.js';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  components: {
    MapComponent
  },
  props: ['loggedStatus', 'userInfo'],
  created() {
    EventBus.$on('coordinates', this.sendCoordinatesToFirebase);
  },
  beforeDestroy() {
    EventBus.$off('coordinates', this.sendCoordinatesToFirebase);
  },
  methods: {
    async sendCoordinatesToFirebase(coordinates) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const { latitude, longitude } = coordinates;

        if (latitude && longitude && user) {
          const db = getFirestore(); // Initialize Firestore
          await addDoc(collection(db, 'emergency-request'), {
            uid: user.uid,
            name: this.userInfo.name,
            roomNumber: this.userInfo.roomNumber,
            latitude: latitude,
            longitude: longitude,
            timestamp: new Date().toTimeString(),
          });
          console.log('Emergency request sent with location:', latitude, longitude);
        } else {
          console.error('Latitude, longitude, or UID is undefined.');
        }
      } catch (e) {
        console.error('Error sending emergency request:', e);
      }
    }
  }
};
</script>

<style>
/* Style as necessary */
</style>
