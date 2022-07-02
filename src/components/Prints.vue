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
          <span class="headline">Print Details</span>
        </v-card-title>

        <v-card-text>
          <p class="mb-2">
            <b>Print ID:</b> {{ editedItem.id }}<br />
            <b>Timestamp:</b> {{ editedItem.createdOn }}<br />
            <b>Pages to Be Printed:</b> {{ editedItem.pages }}<br />
            <b>Price:</b> {{ editedItem.price }}<br />
            <b>Payment Method:</b> {{ editedItem.payMethod }}<br />
          </p>

          <p class="mb-0">
            <b>Files:</b><br />
            <v-chip
              class="ma-1 pr-4"
              v-for="file in editedItem.dFiles"
              :key="file.name"
              :href="file.link"
              target="_blank"
            >
              {{ file.name }}<v-icon right>mdi-open-in-new</v-icon>
            </v-chip>
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="close">Close</v-btn>
          <v-btn
            color="primary darken-1"
            @click="save"
            v-if="!editedItem.printed"
          >
            <v-icon left>mdi-check-circle</v-icon>
            Printed
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="prints"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      multi-sort
    >
      <template v-slot:item.createdOn="{ item }">
        {{ $moment(item.createdOn).format("DD/MM/YYYY HH:mm:ss") }}
      </template>
      <template v-slot:item.price="{ item }">
        RM{{ item.price.toFixed(2) }}
      </template>
      <template v-slot:item.status="{ item }">
        <span v-if="item.status === 'Printed'" class="green--text"
          >Printed</span
        >
        <span v-else class="red--text">Pending</span>
      </template>
      <template v-slot:item.edit="{ item }">
        <v-icon small @click="editItem(item)">
          mdi-information
        </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";

export default {
  name: "Prints",
  data() {
    return {
      user: this.$store.state.user,
      dialog: false,
      editedItem: {
        id: "",
        createdOn: "",
        pages: "",
        price: "",
        payMethod: "",
        dFiles: [],
        printed: false
      },
      editedIndex: -1,
      search: "",
      loading: true,
      headers: [
        { text: "Timestamp", value: "createdOn" },
        { text: "Pages", value: "pages" },
        { text: "Price", value: "price" },
        { text: "Payment", value: "payMethod" },
        { text: "Status", value: "status" },
        { text: "Detail", value: "edit", sortable: false }
      ],
      prints: []
    };
  },
  methods: {
    editItem(item) {
      let edit = this.editedItem;

      this.editedIndex = this.prints.indexOf(item);
      edit.id = item.id;
      edit.createdOn = this.$moment(item.createdOn).format(
        "DD/MM/YYYY HH:mm:ss"
      );
      edit.pages = item.pages;
      edit.price = "RM" + item.price.toFixed(2);
      edit.payMethod = item.payMethod;
      edit.dFiles = item.dFiles;
      edit.printed = item.status === "Printed";
      this.dialog = true;
    },
    close() {
      this.dialog = false;
    },
    save() {
      if (!this.editedItem.printed) {
        let data = {
          printId: this.editedItem.id
        };
        this.completePrint(data);
      }
      this.close();
    },
    completePrint(data) {
      var completePrint = firebase.functions().httpsCallable("completePrint");

      return completePrint(data).catch(error => {
        console.log(error);
      });
    }
  },
  created() {
    let folderRef = firebase.storage().ref("prints");
    if (this.user.role.admin) {
      firebase
        .firestore()
        .collection("prints")
        .orderBy("createdOn", "desc")
        .onSnapshot(snap => {
          this.prints = [];
          snap.forEach(doc => {
            let print = doc.data();
            print.id = doc.id;
            print.createdOn = print.createdOn.toDate();
            let dFiles = [];
            print.files.forEach(async file => {
              try {
                let link = await folderRef
                  .child(
                    print.shop +
                      "/" +
                      print.user +
                      "/" +
                      print.folder +
                      "/" +
                      file
                  )
                  .getDownloadURL();
                dFiles.push({ name: file, link: link });
              } catch (error) {
                console.log(error);
              }
            });
            print.dFiles = dFiles;
            this.prints.push(print);
          });
          this.loading = false;
        });
    } else {
      firebase
        .firestore()
        .collection("prints")
        .where("shop", "==", this.user.uid)
        .orderBy("createdOn", "desc")
        .onSnapshot(snap => {
          this.prints = [];
          snap.forEach(doc => {
            let print = doc.data();
            print.id = doc.id;
            print.createdOn = print.createdOn.toDate();
            let dFiles = [];
            print.files.forEach(async file => {
              try {
                let link = await folderRef
                  .child(
                    print.shop +
                      "/" +
                      print.user +
                      "/" +
                      print.folder +
                      "/" +
                      file
                  )
                  .getDownloadURL();
                dFiles.push({ name: file, link: link });
              } catch (error) {
                console.log(error);
              }
            });
            print.dFiles = dFiles;
            this.prints.push(print);
          });
          this.loading = false;
        });
    }
  }
};
</script>
