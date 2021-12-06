<template>
  <div class="sidebar">
    <div class="user">
      <div class="user-picture">
        <img :src="user.picture_url" class="ui circular image" />
      </div>

      <div class="user-info">
        <div class="user-info-pseudo">{{ user.username }}</div>

        <div class="user-info-status ui simple dropdown">
          <div class="available text">En ligne</div>
          <i class="dropdown icon"> </i>
          <div class="menu">
            <div class="item" @click="deauthenticate">
              <i class="logout icon"> </i>
              Déconnexion
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="menu">
      <div class="blue button" @click="openCommunity">
        <i class="users icon"> </i>
        <br />
        <span>Communauté</span>
      </div>
      <div v-if="true" class="blue button" @click="openMessageSearch">
        <i class="search icon"> </i>
        <br />
        <span>Messages</span>
      </div>
      <div class="blue button" @click="openInfo">
        <i class="info icon"> </i>
        <br />
        <span>Informations</span>
      </div>
    </div>
    <div class="conversations">
      <div class="conversation-search">
        <div class="ui fluid search">
          <div class="ui icon input">
            <input
              class="prompt"
              v-model="searchInput"
              placeholder="Rechercher une conversation"
              type="text"
            />
            <i class="search icon"> </i>
          </div>
        </div>
      </div>

      <div
        v-for="conversation in filteredConversations"
        :class="
          selectedConversation === conversation.id
            ? 'selected conversation'
            : 'conversation'
        "
        :key="conversation.id"
        :title="conversation.title"
        @click="openConversation(conversation.id)"
      >
        <a class="avatar">
          <img
            v-if="conversation.type === 'one_to_one'"
            :src="conversation.conversation_picture"
          />
          <span v-else>
            <i class="users icon"></i>
          </span>
        </a>
        <div class="content">
          <div class="metadata">
            <div class="title">
              {{
                conversation.participants.length > 2
                  ? "Groupe: " + conversation.participants.join(", ")
                  : conversation.participants[1]
              }}
            </div>
            <span class="time">{{ formatDate(conversation.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from "@/router";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Sidebar",
  data() {
    return {
      search: "",
      selectedConversation: 0,
      searchInput: ""
    };
  },
  methods: {
    ...mapActions(["deauthenticate"]),
    openCommunity() {
      router.push({ name: "Community" });
    },
    openMessageSearch() {
      router.push({ name: "Search" });
    },
    openConversation(id) {
      this.selectConversation(id);
      console.log(this.selectedConversation);
      router.push({ name: "Conversation", params: { id } });
    },
    openInfo(){
      router.push({ name: "Informations" });
    },
    formatDate(input) {
      if (input) {
        let date = new Date(input);

        return new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(
          date
        );
      }
      return input;
    },
    selectConversation(id) {
      this.selectedConversation = id;
    },
  },
  computed: {
    ...mapGetters(["user", "conversations"]),
    filteredConversations() {
      let formatedConversations = this.conversations;
      formatedConversations = formatedConversations
        .filter(conv =>
          conv.participants.some(p =>
            p.toLowerCase().includes(this.searchInput.toLowerCase())
          )
        )
        .sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      return formatedConversations;
    },
  },
};
</script>

<style scoped src="./Sidebar.css" />
