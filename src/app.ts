import Component from 'vue-class-component'
import * as Vue from "vue";
declare var firebase: any;

@Component({
  props: {
  },
  filters: {
    "reverse": function(value: any[]){
      return value.reverse()
    }
  },
  template: `
    <div>
      <p v-if="user"><img :src="user.photoURL">{{user.displayName}}<button @click="logout">logout</button></p>
      <button v-if="!user" @click="login">login</button>
      <textarea v-if="user" id="code" style="height:300px; width: 500px" v-model="message"></textarea>
      <button v-if="user" @click="send(message)">送信</button>
      <div v-for="item in items | orderBy 'key' -1" track-by="key">
        <img :src="item.val().author.profile_picture">{{item.key}} {{item.val().text}} {{item.val().timestamp}} {{item.val().author.screen_name}} <button @click="remove(item)">x</button>
      </div>
    </div>
  `
})
export class App extends Vue {
  user: FirebaseUser;
  message: string;
  items: Array<FirebaseItem>;
  private auth: any
  private database: any
  private ref: any

  data(): any{
    return {
      user: {},
      message: "",
      items: []
    }
  }

  ready(){
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.ref = this.database.ref('posts');
    this.auth.onAuthStateChanged((user: FirebaseUser)=>{
      this.user = user;
    });
    this.ref.off();
    this.ref.limitToLast(30).on('child_added', (item: FirebaseItem)=>{
      console.log("fetched");
      this.items.push(item)
    });
  }
  login(){
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
  }
  logout(){
    this.auth.signOut();
  }

  remove(post: FirebaseItem){
    this.items.$remove(post)
    this.ref.child(post.key).remove();
  }

  send(message: string){
    var currentUser = this.auth.currentUser;
    var item:FirebaseItemBody = {
      author: {
        uid: this.auth.currentUser.uid,
        full_name: this.auth.currentUser.displayName,
        screen_name: this.auth.currentUser.username ? this.auth.currentUser.username : "", //Only twitter
        profile_picture: this.auth.currentUser.photoURL
      },
      text: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    return this.ref.push(item)
  }
}
interface UploadCallback { (filePath: string): void }
interface FetchCallback { (item: FirebaseItem): void }
export class FirebaseItemBody{
  author: {
    uid: string,
    full_name: string,
    screen_name: string,
    profile_picture: string
  }
  timestamp: number
  text: string
}
interface FirebaseItemValue { (): FirebaseItemBody }
export class FirebaseItem{
  key: string
  val: FirebaseItemValue
}

interface OnAuthStateChangedCallback {(user: FirebaseUser): void}
export class FirebaseUser{
  photoURL: string
  displayName: string
}

