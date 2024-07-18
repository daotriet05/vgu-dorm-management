<template>
  <div>
    <h3>Emergency Requests Admin</h3>
    <map-component></map-component>
    <ul>
      <li v-for="request in requests" :key="request.id">
        <p>Name: {{ request.name }}</p>
        <p>Room: {{ request.roomNumber }}</p>
        <!-- <p>Latitude: {{ request.latitude }}</p>
        <p>Longitude: {{ request.longitude }}</p>
        <p>UID: {{ request.uid }}</p> -->
        <small>Timestamp: {{ request.timestamp }}</small>
        <br/>
        <button @click="deleteRequest(request.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import MapComponent from './Map.vue';

export default {
    components: { MapComponent},
    data() {
        return {
        requests: []
        };
    },
    methods: {
        async fetchRequests() {
        const db = getFirestore(); // Initialize Firestore
        const querySnapshot = await getDocs(collection(db, 'emergency-request'));
        this.requests = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        },
        async deleteRequest(id) {
        const db = getFirestore(); // Initialize Firestore
        await deleteDoc(doc(db, 'emergency-request', id));
        this.requests = this.requests.filter(request => request.id !== id);
        }
    },
    async mounted() {
        await this.fetchRequests();
    }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f9f9f9;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
}

button {
  padding: 5px 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #c0392b;
}
</style>
