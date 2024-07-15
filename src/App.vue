<template>
    <Navbar 
        :loggedStatus="loggedStatus" 
        :userInfo="userInfo"
    ></Navbar>
    <router-view v-slot="{ Component}">
        <component 
            :is="Component"
            :loggedStatus="loggedStatus"
            :userInfo="userInfo"
        />
    </router-view>
    <Footer></Footer>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc} from "firebase/firestore"

export default {
    components: { 
        Navbar,
        Footer
    },
    data(){
        return {
            loggedStatus: false,
            auth: getAuth(),
            userInfo: {
                ID: null,
                name: null,
                permission: null,
                roomNumber: null
            },
            db: getFirestore()
        }
    },
    mounted(){
        onAuthStateChanged(this.auth, (user)=>{
            if (user) {
                this.loggedStatus=true
                this.userInfo.ID=this.auth.currentUser.uid 
                this.getUserInfo()
            }
            else{
                this.loggedStatus=false
                this.userInfo={
                    ID: null,
                    name: null,
                    permission: null,
                    roomNumber: null
                }
            }
        })
    },
    methods: {
        async getUserInfo(){
            try {
                const docRef = doc(this.db, "user-information", this.userInfo.ID)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()){
                    this.userInfo.name=docSnap.data().name
                    this.userInfo.permission=docSnap.data().permission
                    this.userInfo.roomNumber=docSnap.data().roomNumber
                }else{
                    console.log("No such user!")
                }
            } catch (error){
                console.error("Error getting user info:",error)
            }
        }
    }
}
</script>
