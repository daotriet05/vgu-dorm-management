<template>
<div>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-4 offset-lg-4">
                <h2>Support Request Form</h2>
                <form @submit.prevent="submitRequest">
                    <div class="dropdown">
                        <label for="title">Choose your problem type:</label>
                        <select v-model="type" name="title" required>
                            <option value="Noise report">Noise report</option>
                            <option value="Furniture broken">Furniture broken</option>
                            <option value="Electricity problem">Electricity problem</option>
                            <option value="Water problem">Water problem</option>
                        </select>
                    </div>
                    <textarea v-model="message" placeholder="Describe your issue" required></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    </div>
    
</div>
</template>

<script>
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
    props: ['userInfo'],
    data() {
        return {
            type:"Noise report",
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
                    type: this.type,
                    message: this.message,
                    name: this.userInfo.name,
                    roomNumber: this.userInfo.roomNumber,
                    timestamp: serverTimestamp(),
                });
                this.message = "";  // Clear the form after submission
                this.type="Noise report";
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
    .container-fluid{
        margin-top: 40px;
        text-align: center;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 30px;
        background-color: bisque;
    }
    .dropdown{
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px;
        column-gap: 10px;
    }
    textarea {
        margin: 10px;
        width: 90%;
        height: 100px;
        margin-bottom: 20px;
    }
    button {
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
</style>
