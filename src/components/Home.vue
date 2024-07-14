<template>
    <h1> count: {{ num }}</h1>
    <button
        @click.prevent="add_one()"
    >add 1</button>
</template>

<script>
export default {
    props: ['num','add_one']
}
</script>