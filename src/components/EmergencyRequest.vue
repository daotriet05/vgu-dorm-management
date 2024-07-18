<template>
    <router-view v-slot="{ Component}">
        <component 
            :is="Component"
            :loggedStatus="loggedStatus"
            :userInfo="userInfo"
        />
    </router-view>
</template>

<script>
export default {
    props: ['loggedStatus', 'userInfo']
}
</script>