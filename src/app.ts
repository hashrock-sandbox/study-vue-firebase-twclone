import Component from 'vue-class-component'
import * as Vue from "vue";
declare var firebase: any;

@Component({
  props: {
  },
  filters: {
    "date": function(value: number){
      var d = new Date(value);
      return `${d.getFullYear()}-${(d.getMonth()+1)}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
    }
  },
  template: `
    <div>
      <p v-if="user"><img :src="user.photoURL">{{user.displayName}}<button @click="logout">logout</button></p>
      <button v-if="!user" @click="login">login</button>
      <textarea v-if="user" class="message" v-model="message"></textarea>
      <div class="nav">
        <button v-if="user" class="send" @click="send(message)">送信</button>
      </div>
      <div class="item" v-for="item in items | orderBy 'key' -1" track-by="key">
        <img :src="item.val().author.profile_picture" :title="item.val().author.full_name">
        <div class="itemtext">{{item.val().text}}</div>
        <span class="date">{{item.val().timestamp | date}}</span>
        <button @click="remove(item)">x</button>
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
    var provider = new firebase.auth.TwitterAuthProvider();
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
        profile_picture: this.auth.currentUser.photoURL
      },
      text: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    this.ref.push(item).then(()=>{
      this.message = "";
      var t:HTMLTextAreaElement = <HTMLTextAreaElement>document.querySelector(".message");
      t.focus();
    })
  }
}
interface UploadCallback { (filePath: string): void }
interface FetchCallback { (item: FirebaseItem): void }
export class FirebaseItemBody{
  author: {
    uid: string,
    full_name: string,
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

