<template>
    <div>
        <h3>Emergency Request Admin</h3>
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

import MapComponent from './Map.vue'; 
import { getDatabase, ref, onValue, remove } from "firebase/database";

export default {
    components: {
      MapComponent
    },
    props: ['loggedStatus', 'userInfo'],
    data() {
        return {
            requests: []
        };
    },
    methods: {
        fetchRequests() {
            const db = getDatabase();
            const emergencyRef = ref(db, 'emergency_requests');

            onValue(emergencyRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    this.requests = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                } else {
                    this.requests = [];
                }
            });
        },
        async deleteRequest(id) {
            try {
                const db = getDatabase();
                await remove(ref(db, `emergency_requests/${id}`));
                this.requests = this.requests.filter(request => request.id !== id);
            } catch (error) {
                console.error('Error deleting request:', error);
            }
        }
    },
    mounted() {
        this.fetchRequests();
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
