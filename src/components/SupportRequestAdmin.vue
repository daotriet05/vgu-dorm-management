<template>
    <div>
        <h3>Request Support</h3>
        <ul>
        <li v-for="request in requests" :key="request.id">
            <p>Description: {{ request.data().message }}</p>
            <small>Submitted by User Name: {{ request.data().name }}, Room: {{ request.data().roomNumber }}</small>
            <br/>
            <small>At: {{ formatTimestamp(request.data().timestamp) }}</small>
            <br/>
            <button @click="deleteRequest(request.id)">Delete</button>
        </li>
        </ul>
    </div>
</template>
  
<script>
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default {
    data() {
        return {
            requests: [],
            db: getFirestore()
        };
    },
    methods: {
        async fetchRequests() {
            try {
                const querySnapshot = await getDocs(collection(this.db, 'request-support'));
                this.requests = querySnapshot.docs;
            } catch (error) {
                console.error('Error fetching support requests:', error);
            }
        },
        async deleteRequest(id) {
            try {
                await deleteDoc(doc(this.db, 'request-support', id));
                this.requests = this.requests.filter(request => request.id !== id);
            } catch (error) {
                console.error('Error deleting request:', error);
            }
        },
        formatTimestamp(timestamp) {
            return timestamp ? timestamp.toDate().toLocaleString() : 'Timestamp not set';
        }
    },
    mounted() {
        this.fetchRequests();
    },
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
  