<template>
<div>
    <h2>Request Support</h2>
    <form @submit.prevent="submitRequest">
        <textarea v-model="message" placeholder="Describe your issue" required></textarea>
        <button type="submit">Submit</button>
    </form>
</div>
</template>

<script>
import { getFirestore, collection, addDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
    props: ['userInfo'],
    data() {
        return {
            message: "",
            db: getFirestore(),
            auth: getAuth()
        };
    },
    methods: {
        async submitRequest() {
            const user = this.auth.currentUser;
            if (user) {
                try {
                    await addDoc(collection(this.db, "request-support"), {
                        uid: user.uid,
                        message: this.message,
                        name: this.userInfo.name,
                        roomNumber: this.userInfo.roomNumber,
                        timestamp: serverTimestamp(),
                    });
                    this.message = "";  // Clear the form after submission
                } catch (error) {
                    console.error("Error submitting request:", error);
                }
            } else {
                console.error("No user is signed in.");
            }
        }
    }
};
</script>

<style scoped>
form {
display: flex;
flex-direction: column;
align-items: center;
}

textarea {
width: 300px;
height: 100px;
margin-bottom: 20px;
}

button {
padding: 10px 20px;
font-size: 16px;
}
</style>
