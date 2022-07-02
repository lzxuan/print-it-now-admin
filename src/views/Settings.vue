<template>
  <div>
    <v-expansion-panels popout hover focusable :value="0">
      <v-expansion-panel>
        <v-expansion-panel-header
          ripple
          :disable-icon-rotate="profile.icon.fixed"
          class="title text--secondary"
        >
          Profile
          <template v-slot:actions>
            <v-icon :color="profile.icon.color">{{ profile.icon.icon }}</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card flat>
            <v-card-text class="pt-6 pb-0 px-0">
              <v-text-field
                label="Full Name"
                prepend-inner-icon="mdi-account"
                outlined
                required
                v-model.trim="profile.edit.name"
                @input="checkSection(profile)"
              ></v-text-field>
              <v-text-field
                label="Email Address"
                prepend-inner-icon="mdi-email"
                outlined
                readonly
                v-model="profile.edit.email"
              ></v-text-field>
              <v-text-field
                label="Phone Number"
                prepend-inner-icon="mdi-phone"
                outlined
                v-model.trim="profile.edit.phone"
                @input="checkSection(profile)"
              ></v-text-field>
            </v-card-text>

            <v-card-actions class="pt-0 px-0">
              <v-spacer></v-spacer>
              <v-btn color="primary darken-1" @click="saveProfile">
                <v-icon left>mdi-content-save</v-icon>
                Save Profile
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-if="user.role.shop">
        <v-expansion-panel-header
          ripple
          :disable-icon-rotate="shop.icon.fixed"
          class="title text--secondary"
        >
          Shop
          <template v-slot:actions>
            <v-icon :color="shop.icon.color">{{ shop.icon.icon }}</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card flat>
            <v-card-text class="pt-6 pb-0 px-0">
              <v-text-field
                label="Shop Name"
                prepend-inner-icon="mdi-storefront"
                outlined
                required
                v-model.trim="shop.edit.name"
                @input="checkSection(shop)"
              ></v-text-field>
              <v-text-field
                label="Shop Description"
                prepend-inner-icon="mdi-information"
                outlined
                v-model.trim="shop.edit.description"
                @input="checkSection(shop)"
              ></v-text-field>
              <v-text-field
                label="Shop Address"
                prepend-inner-icon="mdi-map-marker"
                outlined
                v-model.trim="shop.edit.address"
                @input="checkSection(shop)"
              ></v-text-field>
              <!--<v-text-field
                label="Printing Limit"
                prepend-inner-icon="mdi-file-alert"
                outlined
                required
                v-model.number="shop.edit.limit"
                hint="Temporarily stop accepting printing tasks after exceeding this number of pages yet to be printed."
                suffix="pages"
                type="number"
                min="0"
                max="1000000"
                step="100"
                @input="checkSection(shop)"
              ></v-text-field>-->
              <div class="mb-8">
                <file-pond
                  ref="pond"
                  labelIdle="Drag &amp; drop your <b>Shop Image</b> or <span class='filepond--label-action'>Browse</span> (PNG only)"
                  acceptedFileTypes="image/png"
                  maxFileSize="1MB"
                  v-on:addfilestart="addFile"
                  v-on:removefile="removeFile"
                />
              </div>
            </v-card-text>

            <v-card-actions class="pt-0 px-0">
              <v-switch
                label="In Business"
                hide-details
                class="pa-0 my-0 mr-1"
                v-model="shop.edit.enabled"
                @change="checkSection(shop)"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn color="primary darken-1" @click="saveShop">
                <v-icon left>mdi-content-save</v-icon>
                Save Shop
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!--<v-expansion-panel v-if="user.role.admin">
        <v-expansion-panel-header
          ripple
          :disable-icon-rotate="pricing.icon.fixed"
          class="title text--secondary"
        >
          Pricing
          <template v-slot:actions>
            <v-icon :color="pricing.icon.color">{{ pricing.icon.icon }}</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card flat>
            <v-card-text class="pt-6 pb-0 px-0">
              <v-text-field
                label="Shop Name"
                prepend-inner-icon="mdi-storefront"
                outlined
                required
                v-model="shop.name"
                prefix="RM"
                type="number"
                min="0.0"
                max="1.0"
                step="0.1"
              ></v-text-field>
              <v-text-field
                label="Shop Description"
                prepend-inner-icon="mdi-information"
                outlined
                v-model="shop.description"
                prefix="RM"
                type="number"
              ></v-text-field>
              <v-text-field
                label="Shop Address"
                prepend-inner-icon="mdi-map-marker"
                outlined
                v-model="shop.address"
                prefix="RM"
                type="number"
              ></v-text-field>
            </v-card-text>

            <v-card-actions class="pt-0 px-0">
              <v-spacer></v-spacer>
              <v-btn color="primary darken-1" @click="savePricing">
                <v-icon left>mdi-content-save</v-icon>
                Save Pricing
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>-->
    </v-expansion-panels>
    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ text }}
      <v-btn color="blue" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
);

export default {
  name: "Settings",
  components: {
    FilePond
  },
  data() {
    return {
      user: this.$store.state.user,
      snackbar: false,
      text: "",
      timeout: 5000,
      profile: {
        icon: {
          icon: "$expand",
          color: "",
          fixed: false
        },
        edit: {
          name: "",
          email: "",
          phone: ""
        },
        original: {
          name: "",
          email: "",
          phone: ""
        }
      },
      shop: {
        icon: {
          icon: "$expand",
          color: "",
          fixed: false
        },
        edit: {
          name: "",
          description: "",
          address: "",
          limit: 0,
          enabled: false
        },
        original: {
          name: "",
          description: "",
          address: "",
          limit: 0,
          enabled: false
        }
      },
      file: false,
      pricing: {
        icon: {
          icon: "$expand",
          color: "",
          fixed: false
        },
        edit: {
          offerQuantity: 30,
          normal: {
            oneSide: {
              black: 0.2,
              color: 0.8
            },
            twoSide: {
              black: 0.1,
              color: 0.4
            }
          },
          offer: {
            oneSide: {
              black: 0.2,
              color: 0.8
            },
            twoSide: {
              black: 0.1,
              color: 0.4
            }
          }
        }
      }
    };
  },
  methods: {
    saveProfile() {
      if (this.sectionEdited(this.profile)) {
        let edit = this.profile.edit;
        let user = firebase.auth().currentUser;

        user.updateProfile({ displayName: edit.name }).then(() => {
          firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .update({ name: edit.name, phoneNumber: edit.phone })
            .then(() => {
              this.saveSuccess(this.profile, "Profile updated successfully.");
            });
        });
      }
    },
    saveShop() {
      if (this.sectionEdited(this.shop)) {
        firebase
          .firestore()
          .collection("shops")
          .doc(this.user.uid)
          .set(this.shop.edit)
          .then(() => {
            this.saveSuccess(this.shop, "Shop updated successfully.");
          });
      }
      if (this.file) {
        firebase
          .storage()
          .ref("shops/" + this.user.uid + ".png")
          .put(this.$refs.pond.getFile().file)
          .then(() => {
            this.saveSuccess(this.shop, "Shop updated successfully.");
          });
      }
    },
    showSnackbar(msg) {
      this.text = msg;
      this.snackbar = true;
    },
    addFile() {
      this.file = true;
      this.setWarningIcon(this.shop);
    },
    removeFile() {
      this.file = false;
      this.resetIcon(this.shop);
    },
    savePricing() {
      if (this.sectionEdited(this.pricing)) {
        this.setSuccessIcon(this.pricing);
      }
    },
    sectionEdited(section) {
      return Object.entries(section.original).some(
        ([key, value]) => (value || "") != (section.edit[key] || "")
      );
    },
    checkSection(section) {
      if (this.sectionEdited(section)) {
        this.setWarningIcon(section);
      } else {
        this.resetIcon(section);
      }
    },
    saveSuccess(section, msg) {
      section.original = Object.assign({}, section.edit);
      this.setSuccessIcon(section);
      this.showSnackbar(msg);
      setTimeout(() => {
        this.resetIcon(section);
      }, this.timeout);
    },
    resetIcon(section) {
      section.icon = {
        icon: "$expand",
        color: "",
        fixed: false
      };
    },
    setWarningIcon(section) {
      section.icon = {
        icon: "mdi-alert-circle",
        color: "orange",
        fixed: true
      };
    },
    setSuccessIcon(section) {
      section.icon = {
        icon: "mdi-check-circle",
        color: "green",
        fixed: true
      };
    }
  },
  created() {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .get()
      .then(user => {
        if (user.exists) {
          let u = user.data();
          this.profile.original = {
            name: u.name,
            email: u.email,
            phone: u.phoneNumber
          };
          this.profile.edit = Object.assign({}, this.profile.original);
        }
      });

    if (this.user.role.shop) {
      firebase
        .firestore()
        .collection("shops")
        .doc(this.user.uid)
        .get()
        .then(shop => {
          if (shop.exists) {
            let s = shop.data();
            this.shop.original = {
              name: s.name,
              description: s.description,
              address: s.address,
              limit: s.limit,
              enabled: s.enabled,
              file: false
            };
            this.shop.edit = Object.assign({}, this.shop.original);
          }
        });
    }
    /*
    if (this.user.role.admin) {
      firebase
        .firestore()
        .collection("pricing")
        .doc("1")
        .get()
        .then(pricing => {
          if (pricing.exists) {
            let s = pricing.data();
            this.shop.original.name = s.name;
            this.shop.edit = Object.assign({}, this.shop.original);
          }
        });
    } */
  }
};
</script>
