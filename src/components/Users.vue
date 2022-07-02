<template>
  <v-card flat>
    <v-card-title>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        outlined
        hide-details
        clearable
      ></v-text-field>
    </v-card-title>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit User</span>
        </v-card-title>

        <v-card-text>
          <p class="mb-0">
            <b>Name:</b> {{ editedItem.name }}<br />
            <b>Email:</b> {{ editedItem.email }}<br />
            <b>Phone Number:</b> {{ editedItem.phoneNumber }}
          </p>

          <p class="mt-2 mb-0"><b>Role:</b></p>
          <v-checkbox
            v-model="editedItem.role.admin"
            label="Admin"
            hide-details
            color="primary darken-4"
            class="pa-0 ma-0"
          ></v-checkbox>
          <v-checkbox
            v-model="editedItem.role.shop"
            label="Shop"
            hide-details
            color="primary darken-2"
            class="pa-0 ma-0"
          ></v-checkbox>

          <p class="mt-2 mb-0"><b>Status:</b></p>
          <v-checkbox
            v-model="editedItem.disabled"
            label="Disable this user account"
            hide-details
            color="red darken-2"
            class="pa-0 ma-0"
          ></v-checkbox>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="close">Cancel</v-btn>
          <v-btn color="primary darken-1" @click="save">
            <v-icon left>mdi-content-save</v-icon>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="users"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      multi-sort
    >
      <template v-slot:item.disabled="{ item }">
        <span v-if="item.disabled" class="red--text">Disabled</span>
        <span v-else class="green--text">Enabled</span>
      </template>
      <template v-slot:item.edit="{ item }">
        <v-icon small @click="editItem(item)">
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";

export default {
  name: "Users",
  data() {
    return {
      user: this.$store.state.user,
      dialog: false,
      editedItem: {
        name: "",
        email: "",
        phoneNumber: "",
        role: {
          admin: false,
          shop: false
        },
        disabled: false
      },
      editedIndex: -1,
      search: "",
      loading: true,
      headers: [
        { text: "Name", value: "name" },
        { text: "Email", value: "email" },
        { text: "Phone", value: "phoneNumber" },
        { text: "Role", value: "roleString" },
        { text: "Status", value: "disabled" },
        { text: "Edit", value: "edit", sortable: false }
      ],
      users: []
    };
  },
  methods: {
    roleToString(role) {
      let string = "";
      let separate = false;

      Object.entries(role).forEach(([key, value]) => {
        if (value) {
          if (separate) string += ", ";
          string += key.charAt(0).toUpperCase() + key.slice(1);
          separate = true;
        }
      });

      return string;
    },
    editItem(item) {
      let edit = this.editedItem;

      this.editedIndex = this.users.indexOf(item);
      edit.name = item.name;
      edit.email = item.email;
      edit.phoneNumber = item.phoneNumber;
      edit.role = Object.assign({}, item.role);
      edit.disabled = item.disabled;
      this.dialog = true;
    },
    close() {
      this.dialog = false;
    },
    save() {
      let user = this.users[this.editedIndex];
      let edit = this.editedItem;

      let edited =
        Object.entries(user.role).some(
          ([key, value]) => value != edit.role[key]
        ) || user.disabled != edit.disabled;

      if (edited) {
        let data = { uid: user.uid, role: edit.role, disabled: edit.disabled };

        if (this.setUserRoleAndStatus(data)) {
          user.role = data.role;
          user.roleString = this.roleToString(data.role);
          user.disabled = data.disabled;
          this.close();
        }
      } else {
        this.close();
      }
    },
    setUserRoleAndStatus(data) {
      var setUserRoleAndStatus = firebase
        .functions()
        .httpsCallable("setUserRoleAndStatus");

      return setUserRoleAndStatus(data).catch(error => {
        console.log(error);
      });
    }
  },
  created() {
    firebase
      .firestore()
      .collection("users")
      .orderBy("createdOn", "desc")
      .onSnapshot(snap => {
        this.users = [];
        snap.forEach(doc => {
          let user = doc.data();
          user.uid = doc.id;
          user.roleString = this.roleToString(user.role);
          if (this.user.uid != user.uid) this.users.push(user);
        });
        this.loading = false;
      });
  }
};
</script>
