<template>
  <v-card>
    <v-tabs background-color="primary darken-2" dark>
      <v-tab v-if="user.role.admin" @click="setComponent('Users')">
        <v-icon left>mdi-account-multiple</v-icon>
        Users
      </v-tab>

      <v-tab v-if="user.role.shop" @click="setComponent('Prints')">
        <v-icon left>mdi-printer</v-icon>
        Prints
      </v-tab>
    </v-tabs>

    <component :is="component"></component>
  </v-card>
</template>

<script>
import Users from "../components/Users";
import Prints from "../components/Prints";

export default {
  name: "Dashboard",
  data() {
    return {
      component: null,
      user: this.$store.state.user
    };
  },
  methods: {
    setComponent(component) {
      this.component = component;
    }
  },
  components: {
    Users,
    Prints
  },
  created() {
    if (this.user.role.admin) {
      this.setComponent(Users);
    } else if (this.user.role.shop) {
      this.setComponent(Prints);
    }
  }
};
</script>
