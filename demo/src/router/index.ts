import Vue from "vue";
import VueRouter from "vue-router";
import Foo from "../views/Foo.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/foo/:id",
    name: "foo",
    component: Foo
  },
  {
    path: "/bar",
    name: "bar",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/Bar.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
