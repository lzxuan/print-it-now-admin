import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import store from "./store";
import router from "./router";
import vuetify from "./plugins/vuetify";
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import VueMoment from "vue-moment";
import "./registerServiceWorker";

Vue.config.productionTip = false;

const firebaseConfig = {
  apiKey: "AIzaSyBc26jSpygFfjJDsubgFXPoKaO31VrKPJg",
  authDomain: "printitnow.firebaseapp.com",
  databaseURL: "https://printitnow.firebaseio.com",
  projectId: "printitnow",
  storageBucket: "printitnow.appspot.com",
  messagingSenderId: "307956112754",
  appId: "1:307956112754:web:4ccd863e54addc74a991eb",
  measurementId: "G-WE1P4HRHVK"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const appName = "Print It Now";
Vue.prototype.$appName = appName;
document.title = appName;

Vue.use(VueMoment);

let app;

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    user
      .getIdTokenResult()
      .then(idTokenResult => {
        if (idTokenResult.claims.role) {
          user.role = idTokenResult.claims.role;
          next();
        } else {
          user.getIdToken(true).then(() => {
            user.getIdTokenResult().then(idTokenResult => {
              user.role = idTokenResult.claims.role;
              next();
            });
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    next();
  }

  function next() {
    store.dispatch("fetchUser", user);

    if (!app) {
      app = new Vue({
        store,
        router,
        vuetify,
        render: h => h(App)
      }).$mount("#app");
    }
  }
});
