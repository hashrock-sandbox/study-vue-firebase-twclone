<template>
  <div>
    <div class="header">
      <div class="header__title">作業ったー</div>
      <div class="header__login" v-if="user">
        {{user.displayName}}
        <button @click="logout">logout</button>
      </div>
      <button v-if="!user" @click="login">login</button>
    </div>
    <div class="nav">
      <textarea v-if="user" class="message" v-model="message" @keyup.ctrl.enter="send(message)"></textarea>
      <button v-if="user" class="send" @click="send(message)">送信</button>
    </div>
    <div class="item" :key="item.id" v-for="(item) in reversed" track-by="key">
      <div class="item__info">
        <div class="item__username">{{item.author.full_name}}</div>
        <div class="item__date">{{item.timestamp | date}}</div>
        <div class="item__remove" @click="remove(item)">×</div>
      </div>
      <div class="itemtext">{{item.text}}</div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import firebase from "firebase";

export class FirebaseItemBody {
  id: string;
  author: {
    uid: string;
    full_name: string;
  };
  timestamp: firebase.firestore.Timestamp;
  text: string;
}
interface FirebaseItemValue {
  (): FirebaseItemBody;
}
export class FirebaseItem {
  key: string;
  val: FirebaseItemValue;
}

interface OnAuthStateChangedCallback {
  (user: FirebaseUser): void;
}
export class FirebaseUser {
  photoURL: string;
  displayName: string;
}

export default Vue.extend({
  filters: {
    date: function(value: firebase.firestore.Timestamp) {
      if (!value) {
        return "";
      }
      const d = value.toDate();
      return `${d.getFullYear()}-${d.getMonth() +
        1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    }
  },
  data() {
    return {
      user: {},
      message: "",
      items: []
    };
  },
  computed: {
    reversed() {
      let sorted = this.items.slice();
      sorted.sort((a, b) => {
        return -1 * (a.timestamp.toDate() - b.timestamp.toDate());
      });
      return sorted;
    }
  },
  methods: {
    login() {
      this.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    },
    logout() {
      this.auth.signOut();
    },
    remove(post: FirebaseItemBody) {
      this.collection.doc(post.id).delete();
      const index = this.items.indexOf(post);
      this.items.splice(index, 1);
    },

    send(message: string) {
      const currentUser = this.auth.currentUser;
      const item = {
        author: {
          uid: this.auth.currentUser.uid,
          full_name: this.auth.currentUser.displayName
        },
        text: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      this.collection.add(item).then(() => {
        this.message = "";
        const t: HTMLTextAreaElement = <HTMLTextAreaElement>(
          document.querySelector(".message")
        );
        t.focus();
      });
    }
  },
  mounted() {
    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyAKr_3kCBAdOSTvyMywnoHn2kAjhTgQlXE",
      authDomain: "twclone001.firebaseapp.com",
      databaseURL: "https://twclone001.firebaseio.com",
      projectId: "twclone001",
      storageBucket: "twclone001.appspot.com",
      messagingSenderId: "863911734656"
    };
    firebase.initializeApp(config);

    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.collection = this.db.collection("posts");
    this.auth.onAuthStateChanged((user: FirebaseUser) => {
      this.user = user;
    });
    this.collection
      .orderBy("timestamp", "desc")
      .limit(100)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            this.items.push({
              ...change.doc.data({ serverTimestamps: "estimate" }),
              id: change.doc.id
            });
          } else if (change.type === "modified") {
            // commit('set', payload)
          } else if (change.type === "removed") {
            // commit('remove', payload)
          }
        });
      });
  }
});
</script>