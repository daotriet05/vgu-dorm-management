<template>
    <router-view v-slot="{ Component}">
        <component 
            :is="Component"
            :userInfo="userInfo"
        />
    </router-view>
</template>

<script>
export default {
    props: ['userInfo']
}
</script>