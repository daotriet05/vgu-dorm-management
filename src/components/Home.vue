<template>
    <div class="container-fluid">
        <div class="row">
            <img src="@/assets/VGU-campus.jpg" alt="Logo" class="picture">
        </div>
        <div class="content row">
            <div class="col">
                <h2>Account Information</h2>
                <div v-if="userInfo.ID != null">
                    <p>User ID: <span class="info">{{ userInfo.ID }}</span></p>
                    <p>User Name: <span class="info">{{ userInfo.name }}</span></p>
                    <p>User Permission: <span class="info">{{ userInfo.permission }}</span></p>
                    <p>Room Number: <span class="info">{{ userInfo.roomNumber }}</span></p>
                </div>
                <div v-if="userInfo.ID == null">
                    <p>Please log in to see your account information.</p>
                </div>
            </div>
            <div class="col offset-xl-6">
                <h2>Contact</h2>
                <p>Email: <span class="info">vgudorm@vgu.edu.vn</span></p>
                <p>Hotline: <span class="info">09 9999 9999</span></p>
                <p>Management board room number: <span class="info">D1-03</span></p>
                
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['loggedStatus', 'userInfo']
}
</script>

<style scoped>
    .container-fluid{
        overflow: visible;
        padding-bottom: 5%;
        width: 100%;
    }
    .container-fluid .row{
        margin-bottom: 2%;
    }
    .picture{
        width: 100%;
    }
    .content{
        padding-left: 5%;
        font-size: large;
    }
    .content p .info {
        font-style: italic;
        font-size: 0.9em;
    }
</style>
