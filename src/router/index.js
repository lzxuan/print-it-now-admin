import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue"),
    meta: {
      requiresSignIn: true
    }
  },
  {
    path: "/signin",
    name: "Sign In",
    component: () => import("../views/SignIn.vue")
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/Settings.vue"),
    meta: {
      requiresSignIn: true
    }
  },
  {
    path: "/privacy",
    name: "Privacy Policy",
    component: () => import("../views/Privacy.vue")
  },
  {
    path: "/terms",
    name: "Terms & Conditions",
    component: () => import("../views/Terms.vue")
  },
  {
    path: "*",
    redirect: "/"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  const requiresSignIn = to.matched.some(x => x.meta.requiresSignIn);
  const signedIn = router.app.$store.state.user != null;

  document.title = to.name + " | " + router.app.$appName;

  if (requiresSignIn && !signedIn) {
    next("/signin");
  } else {
    next();
  }
});

export default router;
