import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import CushaxClient from "cushax-client";

Vue.config.productionTip = false;

Vue.use(
  CushaxClient({
    state: {
      user: "boen"
    },
    mutations: {
      changeUser(state: any, user: string) {
        state.user = user;
      }
    },
    modules: {
      foo: {
        state: {
          $params: {
            // router params & custom params from $page.update(params)
            id: "",
            age: 0
          },
          $query: {
            // router query
          },
          $event: {
            // custom event, use $page.emit("save", {name: "boen"})
            save: { name: "" }
          },
          // page data
          age: 18
        },
        mutations: {
          changeAge(state: any, age: number) {
            state.age = age;
          }
        }
      }
    }
  })
);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
