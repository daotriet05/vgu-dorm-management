<template>
    <Navbar :loggedUser="loggedUser" :login="login" :logout="logout"></Navbar>
    <router-view v-slot="{ Component}">
      <component :is="Component" :num="num"  :add_one="add_one"/>
    </router-view>
    <Footer></Footer>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  components: { 
    Navbar,
    Footer
  },
  data(){
    return {
      num: 0,
      loggedUser: false,
    }
  },
  methods: {
    add_one(){
      this.num = this.num+1
    },
    login(){
        this.$router.push('/login')
        this.loggedUser=true
    },
    logout(){
        this.$router.push('/')
        this.loggedUser=false
    }
  }
}
</script>
