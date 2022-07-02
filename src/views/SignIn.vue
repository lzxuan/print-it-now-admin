<style>
.firebaseui-idp-list {
  padding-left: 0px !important;
}
</style>
<template>
  <div>
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export default {
  name: "SignIn",
  mounted() {
    let ui = firebaseui.auth.AuthUI.getInstance();
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth());
    }

    var uiConfig = {
      callbacks: {
        uiShown: function() {
          document.getElementById("loader").style.display = "none";
        }
      },
      signInFlow: "popup",
      signInSuccessUrl: "/",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        "microsoft.com",
        firebase.auth.GithubAuthProvider.PROVIDER_ID
      ],
      tosUrl: "/terms",
      privacyPolicyUrl: "/privacy"
    };
    ui.start("#firebaseui-auth-container", uiConfig);
  }
};
</script>
