<template>
  <v-app>
    <template v-if="user">
      <v-navigation-drawer v-model="drawer" app>
        <v-list-item two-line class="my-2">
          <v-list-item-avatar>
            <v-img :src="user.photoURL" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>
              {{ user.displayName }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ user.email }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list nav>
          <v-list-item-group color="primary">
            <v-list-item :to="'/'">
              <v-list-item-action class="ml-2 mr-6">
                <v-icon>mdi-view-dashboard</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item :to="'/settings'">
              <v-list-item-action class="ml-2 mr-6">
                <v-icon>mdi-cog</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <v-divider></v-divider>

        <v-list nav>
          <v-list-item link @click="signOut">
            <v-list-item-action class="ml-2 mr-6">
              <v-icon color="red darken-3">mdi-logout</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="red--text text--darken-3">
                Sign Out
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-app-bar color="primary" app dark>
      <v-app-bar-nav-icon v-if="user" @click="drawer = !drawer" />

      <v-img class="shrink ml-1 mr-2" src="./assets/logo.svg" max-width="35" />

      <v-toolbar-title>
        <span>{{ $appName }}</span>
      </v-toolbar-title>

      <v-chip
        class="ml-3 text-uppercase font-weight-medium"
        outlined
        color="primary lighten-5"
        text-color="white"
        style="letter-spacing: 0.12em; border-width: 0.09em;"
      >
        {{ $route.name }}
      </v-chip>
    </v-app-bar>

    <v-content>
      <div class="pa-5">
        <router-view></router-view>
      </div>
    </v-content>

    <v-footer color="primary" app absolute padless>
      <v-col class="text-center white--text body-2" cols="12">
        &copy; {{ new Date().getFullYear() }} Print It Now
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";

export default {
  name: "App",
  data() {
    return {
      drawer: null,
      user: this.$store.state.user
    };
  },
  methods: {
    async signOut() {
      await firebase.auth().signOut();
      this.user = null;
      this.$router.replace("/signin");
    }
  }
};
</script>
