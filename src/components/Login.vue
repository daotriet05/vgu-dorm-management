<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-4 offset-lg-4">
                <h2>Login form</h2>
                <div class="login">
                    <p><input type="text" placeholder="Email" v-model="email"/></p>
                    <p><input type="password" placeholder="Password" v-model="password"/></p>
                    <p>If you don't have an account, <br> please contact VGU DORM MANAGEMENT!</p>
                    <p v-if="errorMessage!=''">{{ errorMessage }}</p>
                    <p><button @click="login">Submit</button></p>
                </div>
            </div>
        </div>
    </div>
    
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

<style scoped>
    .container-fluid{
        margin-top: 200px;
        text-align: center;
    }
    @media only screen and (min-width: 600px) {
        .container-fluid{
            margin-top: 70px;
        }
        .container-fluid h2{
            padding-top: 50px;
        }
    }
    .login{
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
        background-color: bisque;
        padding: 20px;
        border-radius: 2%;
        box-shadow: 0 0 7px rgb(247, 202, 148);
    }
    input{
        width: 300px;
    }
    button {
        padding: 10px 20px;
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
 