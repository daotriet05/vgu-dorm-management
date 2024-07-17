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
    import { getDatabase, ref, set, update } from "firebase/database";
    import { getFirestore, doc, getDoc } from "firebase/firestore"
    import { getAuth } from "firebase/auth";

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
                        const { latitude, longitude } = coordinates;
                        const auth = getAuth();
                        const user = auth.currentUser;

                        if(latitude && longitude && user) {
                            const db = getDatabase();
                            const emergencyRef = ref(db, `emergency_requests/${user.uid}`);

                            await set(emergencyRef, {
                                uid: user.uid,
                                name: this.userInfo.name,
                                roomNumber: this.userInfo.roomNumber,
                                latitude: latitude,
                                longitude: longitude,
                                timestamp: new Date().toTimeString(),
                            });
                            console.log("Emergency request sent with location:", latitude, longitude);
                    } else {
                        console.error("Latitude, longitude, or UID is undefined.");
                    } 
                } catch(e) {
                    console.error("Error sending emergency request: ", e);
                }
            }

        }

    }
    </script>
    
    <style>
    /* Style as necessary */
    </style>
