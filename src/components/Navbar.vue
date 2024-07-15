<template>
        <nav class="navbar navbar-expand-lg">
                <div>
                        <img src="@\assets\VGU-Logo.png" alt="Logo" class="logo">
                </div>
                
                <ul class="navigation-link navbar-nav me-auto mb-2 mb-lg-1">
                    <li class="nav-item">
                        <a
                            class="nav-link"
                            aria-current="page"
                            title="Home page"
                            @click.prevent="$router.push('/')"
                        >Home</a>
                    </li>

                    <li class="nav-item">
                        <a
                            class="nav-link"
                            aria-current="page"
                            @click.prevent="navigateSupportRequest"
                        >Support Request</a>
                    </li>
                    
                    <li class="nav-item">
                        <a
                            class="nav-link"
                            aria-current="page"
                            @click.prevent="navigateEmergencyRequest"
                        >Emergency Request</a>
                    </li>
                </ul>

                <div class="log-in-out">
                    <form class="d-flex">
                        <button
                            class="btn btn-primary"
                            @click.prevent="changeLoggedStatus"
                        >{{loggedStatus ? 'log out' : 'log in'}}</button>
                    </form>
                </div>
                
        </nav>

</template>

<script>

import { getAuth, signOut } from 'firebase/auth';

export default {
    props: ['loggedStatus', 'userInfo'],
    data(){
        return {
            auth: getAuth()
        }
    },
    methods: {
        changeLoggedStatus(){
            if (this.loggedStatus){
                signOut(this.auth).then(()=>{
                    this.$router.push('/')
                })
            }
            else{
                this.$router.push('/Login')
            }
        },
        navigateSupportRequest(){
            if (this.loggedStatus==false) alert('please log in!')
            else
                if (this.userInfo.permission=='user') this.$router.push('/SupportRequest/User')
                else this.$router.push('/SupportRequest/Admin')
        },
        navigateEmergencyRequest(){
            if (this.loggedStatus==false) alert('please log in!')
            else
                if (this.userInfo.permission=='user') this.$router.push('/EmergencyRequest/User')
                else this.$router.push('/EmergencyRequest/Admin')
        }
    }
}
</script>

<style scoped>
nav {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #333;
    color: #fff;
}
.emphasize {
    text-decoration: underline;
}
.logo {
    display: fixed;
    height: 40px; /* Adjust the height as needed */
}
.nav-link {
    cursor: pointer;
    color: #fff
}
</style>