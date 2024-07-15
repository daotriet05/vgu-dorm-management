<template>
    <p>Emergency Request Admin</p>
    <p>{{ userInfo.name }}</p>
</template>

<script>
export default {
    props: ['loggedStatus', 'userInfo']
}
</script>