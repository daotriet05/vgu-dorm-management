<template>
    <h1>Home page</h1>
    <p>Login Status: {{ loggedStatus }}</p>
    <h2>Account Information</h2>
    <template v-if="userInfo.ID != null">
        <p>User ID: {{ userInfo.ID }}</p>
        <p>User Name: {{ userInfo.name }}</p>
        <p>User Permission: {{ userInfo.permission }}</p>
        <p>Room Number: {{ userInfo.roomNumber }}</p>
    </template>
    <p v-else>Please log in to see your account information.</p>
</template>

<script>
export default {
    props: ['loggedStatus', 'userInfo']
}
</script>