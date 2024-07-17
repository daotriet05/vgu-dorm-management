<template>
    <div>
      <p>Emergency Request User</p>
      <p>{{ userInfo.name }}</p>
      <!-- Include the MapComponent, assuming userInfo includes 'location' with 'lat' and 'lng' -->
      <map-component :locations="[{lat: userInfo.location.lat, lng: userInfo.location.lng}]"></map-component>
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
        data() {
            return {
                uid: null,
                userInfo: {
                    name: null,
                    roomNumber: null,
                },
            };
        },
        mounted() {
            this.getUserUid();
        },
        methods: {
            async getUserUid() {
                const auth = getAuth();
                const user = auth.currentUser;
                if(user) {
                    this.uid = user.uid;
                    await this.getUserInfo();
                } else {
                    console.error("No user is signed in.");
                }
            },
            async getUserInfo() {
                try{
                    const db = getFirestore();
                    const userDoc = doc(db, "user-information");
                    const docSnap = await getDoc(userDoc);
                    if(docSnap.exists()){
                        this.userInfo.name = docSnap.data().name;
                        this.userInfo.roomNumber = docSnap.data().roomNumber;
                    } else {
                        console.error("No user data available");
                    }
                } catch(error) {
                    console.error("Error fetching user info:", error);
                }
            },
            async sendCoordinatesToFirebase(coordinates) {
                if(latitude && longitude && this.uid) {
                try {
                    const { latitude, longitude } = coordinates;
                    const db = getDatabase();
                    const emergencyRef = ref(db, `emergency_requests/${this.uid}`);

                    await set(emergencyRef, {
                        // uid: this.uid,
                        // name: this.userInfo.name,
                        // roomNumber: this.userInfo.roomNumber,
                        latitude: latitude,
                        longitude: longitude,
                        timestamp: new Date().toTimeString(),
                    });
                    console.log("Emergency request sent with location:", latitude, longitude);
                } catch(e) {
                console.error("Error sending emergency request: ", e);
                }
                }
            }

        }

    }
    </script>
    
    <style>
    /* Style as necessary */
    </style>
    