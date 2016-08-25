declare var firebase: any;

export class Junk {
  private auth: any
  private database: any
  private ref: any

  constructor(onAuthStateChanged: OnAuthStateChangedCallback) {
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.ref = this.database.ref('posts');
    this.auth.onAuthStateChanged(onAuthStateChanged);
  };

  fetch(num: number, cb: FetchCallback) {
    this.ref.off();
    this.ref.limitToLast(num).on('child_added', cb);
  }

  login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
  }

  logout() {
    this.auth.signOut();
  }

  post(text: string) {
    var currentUser = this.auth.currentUser;
    var item:JunkItemBody = {
      author: {
        uid: this.auth.currentUser.uid,
        full_name: this.auth.currentUser.displayName,
        screen_name: this.auth.currentUser.username ? this.auth.currentUser.username : "", //Only twitter
        profile_picture: this.auth.currentUser.photoURL
      },
      text: text,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    return this.ref.push(item)
  }

  remove(postId: string){
    return this.ref.child(postId).remove();
  }

  get user() {
    return this.auth.currentUser;
  }
}

interface UploadCallback { (filePath: string): void }
interface FetchCallback { (item: JunkItem): void }
export class JunkItemBody{
  author: {
    uid: string,
    full_name: string,
    screen_name: string,
    profile_picture: string
  }
  timestamp: number
  text: string
}

interface JunkItemValue { (): JunkItemBody }
export class JunkItem{
  key: string
  val: JunkItemValue
}

interface OnAuthStateChangedCallback {(user: JunkUser): void}
export class JunkUser{
  photoURL: string
  displayName: string
}
