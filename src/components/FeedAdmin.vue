<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-4 offset-lg-4">
                <h2>Adding Feed Form</h2>
                <div class="add-feed"> 
                    <form >
                        <div class="title">
                            <label for="title">Title:</label>
                            <input v-model="title" name="title" placeholder="Title" required>
                        </div>
                        <label for="content">Content:</label>
                        <textarea v-model="content" name="content" placeholder="Content" required></textarea>
                    </form>
                    <button @click.prevent="submitFeed">Submit</button>
                </div>
            </div>
        </div>

        <div class="row feed-list">
            <div class="col-lg-6 offset-lg-3">
                <h2>Feed</h2>
                <ul>
                <li v-for="feed in sortedFeeds" :key="feed.id">
                    <div class="row">
                        <div class="col-lg-10 col-12">
                            <p><span class="title">Type: {{ feed.data().title }}</span></p>
                            <p>Content: {{ feed.data().content }}</p>
                            <p>At: {{ formatTimestamp(feed.data().timestamp) }}</p>
                        </div>
                        <div class="col-lg-2 col-12">
                            <button @click="deleteFeed(feed.id)">Delete</button>
                        </div>
                    </div>
                    
                    
                </li>
                </ul>
            </div>
        </div>
    </div>

</template>

<script>
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
    props: ['userInfo'],
    computed: {
        sortedFeeds() {
        // Assuming 'timestamp' is a Unix timestamp; adjust if it's a different format
        return this.feeds.sort((a, b) => b.data().timestamp - a.data().timestamp);
        }
    },
    data() {
        return {
            title: "",
            content: "",
            db: getFirestore(),
            auth: getAuth(),
            feeds: [],
        };
    },
    methods: {
        async submitFeed() {
            const user = this.auth.currentUser;
            if (user) {
                try {
                    await addDoc(collection(this.db, "feed"), {
                        uid: user.uid,
                        title: this.title,
                        content: this.content,
                        timestamp: serverTimestamp(),
                    });
                    this.content = "";  // Clear the form after submission
                    this.title="";
                    this.fetchFeeds()
                } catch (error) {
                    console.error("Error submitting feed:", error);
                }
            } else {
                console.error("No user is signed in.");
            }
        },
        async fetchFeeds() {
            try {
                const querySnapshot = await getDocs(collection(this.db, 'feed'));
                this.feeds = querySnapshot.docs;
            } catch (error) {
                console.error('Error fetching feeds:', error);
            }
        },
        async deleteFeed(id) {
            try {
                await deleteDoc(doc(this.db, 'feed', id));
                this.feeds = this.feeds.filter(feed=> feed.id !== id);
            } catch (error) {
                console.error('Error deleting feed:', error);
            }
        },
        formatTimestamp(timestamp) {
            return timestamp ? timestamp.toDate().toLocaleString() : 'Timestamp not set'; //setup this later
        }
    },
    mounted() {
        this.fetchFeeds();
    },
};
</script>

<style scoped>
    .container-fluid{
        margin: 200px 0;
        text-align: center;
        overflow: visible;
    }
    @media only screen and (min-width: 600px) {
        .container-fluid{
            margin-top: 70px;
        }
        .container-fluid h2{
            padding-top: 50px;
        }
    }
    .add-feed{
        margin-top: 20px;
        background-color: bisque;
        border-radius: 2%;
        box-shadow: 0 0 7px rgb(247, 202, 148);
        padding: 20px;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        row-gap: 10px;
    }
    .title{
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px 0;
        column-gap: 10px;
    }
    .title input{
        width: 80%;
    }
    textarea {
        width: 100%;
        height: 100px;
        margin-bottom: 20px;
    }
    button{
        width: 100px;
        padding: 10px 20px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-bottom: 20px;
    }
    button:hover {
        background-color: #c0392b;
    }
    .feed-list{
        margin-top: 40px;
        text-align: center;
    }
    .feed-list .col-lg-2 {
        display: flex;
        align-items: center;  /* Aligns children (the button) vertically in the center */
        justify-content: center; /* Centers the button horizontally */
    }
    .feed-list ul {
        list-style-type: none;
        padding: 0;
        margin-top: 20px;
        text-align: left;
    }

    .feed-list li {
        background-color: #f9f9f9;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
    }
    .feed-list li p{
        margin-left: 20px;
    }
    .feed-list .title{
        font-size: 20px;
    }
</style>
