<template>
    <p>Emergency Request User</p>
    <p>{{ userInfo.name }}</p>
</template>

<script>
export default {
    props: ['loggedStatus', 'userInfo']
}
</script>