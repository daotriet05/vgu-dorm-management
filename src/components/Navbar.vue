<template>
        <nav>
                <div>
                        <img src="@\assets\VGU-Logo.png" alt="Logo" class="logo">
                </div>
                
                <div class="navigation-link">
                        <router-link
                                to="/Home"
                                class="nav-link"
                                active-class="active"
                        >Home</router-link>
                        <router-link
                                to="/SupportRequest"
                                class="nav-link"
                                active-class="active"
                        >Support Request</router-link>
                        <router-link
                                to="/EmergencyRequest"
                                class="nav-link"
                                active-class="active"
                        >Emergency Request</router-link>
                </div>

                <div class="log-in-out">
                        <form class="d-flex">
                                <button
                                        class="btn btn-primary"
                                        @click.prevent="changeStatusUser"
                                >{{loginStatus}}</button>
                        </form>
                </div>
                
        </nav>

</template>

<script>
        export default {
                props: ['loggedUser', 'login', 'logout'],
                computed: {
                        loginStatus(){
                                return this.loggedUser ? 'log out' : 'log in';
                        }
                },
                methods: {
                        changeStatusUser(){
                                if (this.loggedUser) this.logout()
                                else this.login()
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

.logo {
        display: fixed;
        height: 40px; /* Adjust the height as needed */
}
</style>