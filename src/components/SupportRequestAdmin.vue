<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-6 offset-lg-3">
                <h2>Support Request List</h2>
                <ul>
                <li v-for="request in requests" :key="request.id">
                    <div class="row">
                        <div class="col-lg-10 col-12">
                            <p><span class="title">Type: {{ request.data().type }}</span></p>
                            <p>Description: {{ request.data().message }}</p>
                            <p>Submitted by User Name: {{ request.data().name }}, Room: {{ request.data().roomNumber }}</p>
                            <p>At: {{ formatTimestamp(request.data().timestamp) }}</p>
                        </div>
                        <div class="col-lg-2 col-12">
                            <button @click="deleteRequest(request.id)">Delete</button>
                        </div>
                    </div>
                    
                    
                </li>
                </ul>
            </div>
        </div>

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
    .container-fluid{
        margin-top: 40px;
        overflow: visible;
        padding-bottom: 5%;
    }
    .container-fluid h2{
        text-align: center;
    }
    .col-lg-2 {
        display: flex;
        align-items: center;  /* Aligns children (the button) vertically in the center */
        justify-content: center; /* Centers the button horizontally */
    }
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
    .title{
        font-size: 20px;
    }
    button {
        padding: 7px 15px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #c0392b;
    }
</style>
  