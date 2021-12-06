import Vue from "vue";
import VueRouter from "vue-router";
import Community from "@/components/Community/Community";
import Conversation from "@/components/Conversation/Conversation";
import Search from "@/components/Search/Search";
import Server from "@/components/Server/Server";
import Informations from "@/components/Informations/Informations";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Community",
    component: Community
  },
  {
    path: "/conversation/:id",
    name: "Conversation",
    component: Conversation
  },
  {
    path: "/search",
    name: "Search",
    component: Search
  },
  {
    path: "/server",
    name: "Server",
    component: Server
  },
  {
    path: "/info",
    name: "Informations",
    component: Informations
  }
];

const router = new VueRouter({
  routes
});

const originalPush = router.push;
router.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default router;
