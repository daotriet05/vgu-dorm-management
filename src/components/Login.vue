<template>
    <h1>Login form</h1>
    <p><input type="text" placeholder="Email" v-model="email"/></p>
    <p><input type="password" placeholder="Password" v-model="password"/></p>
    <p>If you don't have an account, please contact VGU DORM MANAGEMENT!</p>
    <p v-if="errorMessage!=''">{{ errorMessage }}</p>
    <p><button @click="login">Submit</button></p>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

export default {
    props: ['activateUser', 'activateAdmin'],
    data(){
        return {
            email:"",
            password: "",
            errorMessage: ""
        }
    },
    methods: {
        login(){
            signInWithEmailAndPassword(getAuth(), this.email, this.password)
                .then((data)=>{
                    console.log("Succesfully logged in!")
                    this.$router.push('/')
                })
                .catch((error)=>{
                    console.log(error.code)
                    switch (error.code) {
                    case "auth/invalid-email":
                        this.errorMessage = "Invalid email";
                        break;
                    case "auth/user-not-found":
                        this.errorMessage = "No account with that email was found";
                        break;
                    case "auth/wrong-password":
                        this.errorMessage = "Incorrect password";
                        break;
                    default:
                        this.errorMessage = "Email or password was incorrect";
                        break;
                    }
                })
        }
    }
}
</script>