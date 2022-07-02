const functions = require("firebase-functions");
const admin = require("firebase-admin");
const gcs = require("@google-cloud/storage");

admin.initializeApp();

exports.processSignUp = functions.auth.user().onCreate(async user => {
  const customClaims = {
    role: {
      admin: false,
      shop: false
    }
  };
  await admin.auth().setCustomUserClaims(user.uid, customClaims);
  return admin
    .firestore()
    .collection("users")
    .doc(user.uid)
    .set({
      createdOn: admin.firestore.FieldValue.serverTimestamp(),
      name: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      disabled: user.disabled,
      role: customClaims.role
    });
});

exports.setUserRoleAndStatus = functions.https.onCall(async (data, context) => {
  if (context.auth && context.auth.token.role.admin) {
    if (context.auth.uid === data.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Self-updating prohibited"
      );
    }

    try {
      await admin.auth().setCustomUserClaims(data.uid, { role: data.role });
      await admin.auth().updateUser(data.uid, { disabled: data.disabled });
      if (data.role.shop) {
        await admin
          .firestore()
          .collection("shops")
          .doc(data.uid)
          .set({ enabled: false });
      }
      return admin
        .firestore()
        .collection("users")
        .doc(data.uid)
        .update({
          role: data.role
        });
    } catch (err) {
      console.error(err);
      throw new functions.https.HttpsError("unavailable", "");
    }
  } else {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized");
  }
});

async function calculatePrice(pages, printConfig, shop) {
  shop = "1";
  const pricingDoc = await admin
    .firestore()
    .collection("pricing")
    .doc(shop)
    .get();
  const pricing = pricingDoc.data();

  const color = printConfig.color ? "color" : "black";
  const price = pricing[printConfig.paperSize][color];

  let total = 0.0;

  pages *= printConfig.copies;

  if (printConfig.twoSided) {
    const pageRemain = pages % 2;
    const halfPages = (pages - pageRemain) / 2;

    total = halfPages * price["twoSided"] + pageRemain * price["oneSided"];
  } else {
    total = pages * price["oneSided"];
  }

  return Math.abs(total);
}

exports.pricePrint = functions.https.onCall(async (data, context) => {
  if (context.auth) {
    try {
      return calculatePrice(data.pages, data.printConfig, data.shop);
    } catch (err) {
      console.error(err);
      throw new functions.https.HttpsError("unavailable", "");
    }
  } else {
    throw new functions.https.HttpsError("unauthenticated", "Unauthenticated");
  }
});

exports.createPrint = functions.https.onCall(async (data, context) => {
  if (context.auth && context.auth.uid === data.user) {
    try {
      const printRef = admin
        .firestore()
        .collection("prints")
        .doc();
      const price = await calculatePrice(
        data.pages,
        data.printConfig,
        data.shop
      );

      await printRef.set({
        createdOn: admin.firestore.FieldValue.serverTimestamp(),
        folder: data.folder,
        files: data.files,
        printConfig: data.printConfig,
        pages: data.pages,
        price: price,
        shop: data.shop,
        user: context.auth.uid,
        payMethod: data.payMethod,
        status: "Queuing"
      });

      return { printId: printRef.id, price: price };
    } catch (err) {
      console.error(err);
      throw new functions.https.HttpsError("unavailable", "");
    }
  } else {
    throw new functions.https.HttpsError("unauthenticated", "Unauthenticated");
  }
});

exports.completePrint = functions.https.onCall(async (data, context) => {
  if (context.auth && context.auth.token.role.shop) {
    try {
      const printRef = admin
        .firestore()
        .collection("prints")
        .doc(data.printId);

      await printRef.set(
        {
          completedOn: admin.firestore.FieldValue.serverTimestamp(),
          status: "Printed"
        },
        { merge: true }
      );

      const printDoc = await printRef.get();
      const print = printDoc.data();
      const bucket = admin.storage().bucket();

      return bucket.deleteFiles({
        prefix: "prints/" + print.shop + "/" + print.user + "/" + print.folder
      });
    } catch (err) {
      console.error(err);
      throw new functions.https.HttpsError("unavailable", "");
    }
  } else {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized");
  }
});
