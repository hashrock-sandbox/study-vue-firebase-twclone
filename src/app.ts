import Component from 'vue-class-component'
import * as Vue from "vue";
import {Junk, JunkUser, JunkItem, JunkItemBody} from "./junk"

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
  junk: Junk;
  user: JunkUser;
  message: string;
  items: Array<JunkItem>;

  data(): any{
    return {
      user: {},
      message: "",
      items: []
    }
  }

  ready(){
    this.junk = new Junk((user: JunkUser)=>{
      this.user = user;
    }, (item: JunkItem)=>{
      console.log("fetched");
      this.items.push(item)
    }, 30);
  }
  login(){
    this.junk.login();
  }
  logout(){
    this.junk.logout();
  }

  remove(post: JunkItem){
    this.items.$remove(post)
    this.junk.remove(post.key);
  }

  send(message: string){
    this.junk.post(
      message
    )
  }
}