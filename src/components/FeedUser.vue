<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-6 offset-lg-3">
                <h2>Feed</h2>
                <ul>
                <li v-for="feed in sortedFeeds" :key="feed.id">
                    <div class="row">
                        <div class="col">
                            <p><span class="title">Title: {{ feed.data().title }}</span></p>
                            <p>Description: {{ feed.data().content }}</p>
                            <p>At: {{ formatTimestamp(feed.data().timestamp) }}</p>
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
    computed: {
        sortedFeeds() {
        // Assuming 'timestamp' is a Unix timestamp; adjust if it's a different format
        return this.feeds.sort((a, b) => b.data().timestamp - a.data().timestamp);
        }
    },
    data() {
        return {
            feeds: [],
            db: getFirestore()
        };
    },
    methods: {
        async fetchFeeds() {
            try {
                const querySnapshot = await getDocs(collection(this.db, 'feed'));
                this.feeds = querySnapshot.docs;
            } catch (error) {
                console.error('Error fetching feeds:', error);
            }
        },
        formatTimestamp(timestamp) {
            return timestamp ? timestamp.toDate().toLocaleString() : 'Timestamp not set'; 
        }
    },
    mounted() {
        this.fetchFeeds();
    },
}
</script>

<style scoped>
    .container-fluid{
        margin-top: 200px;
        overflow: visible;
        padding-bottom: 5%;
    }
    @media only screen and (min-width: 600px) {
        .container-fluid{
            margin-top: 70px;
        }
        .container-fluid h2{
            padding-top: 50px;
        }
    }
    .container-fluid h2{
        text-align: center;
    }
    .col-lg-2 {
        display: flex;
        align-items: center;  
        justify-content: center; 
    }
    ul {
        list-style-type: none;
        padding: 0;
        margin-top: 20px;
    }

    li {
        background-color: #f9f9f9;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
    }
    li p{
        margin-left: 20px;
    }
    .title{
        font-size: 20px;
    }
</style>