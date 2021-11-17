<template>
  <div class="community">
    <div class="filter">
      <div class="ui fluid search">
        <div class="ui icon input">
          <input
            v-model="searchInput"
            class="prompt"
            type="text"
            placeholder="Rechercher un utilisateur"
          />
          <i class="search icon"></i>
        </div>
        <div class="results"></div>
      </div>
    </div>
    <div class="users">
      <div
        v-for="userObject in filteredUsers"
        :key="userObject.user.username"
        :class="userObject.selected === true ? 'selected user' : 'user'"
        @click="onClickToggleSelected(userObject.user)"
      >
        <img :src="userObject.user.picture_url" /><span
          :class="userObject.user.awake ? 'available' : ''"
          >{{ userObject.user.username }}</span
        >
      </div>
    </div>

    <div class="actions">
      <button class="ui primary big button" @click="openConversation">
        <i class="conversation icon"></i>
        <span> Ouvrir la conversation (2) </span>
      </button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Community",
  data() {
    return {
      searchInput: "",
      selectedUsers: [],
    };
  },
  methods: {
    ...mapActions(["createOneToOneConversation"]),
    openConversation() {
      let promise = this.createOneToOneConversation("Alice");

      promise.finally(() => {
        console.log("Conversation ouverte !");
      });
    },
    onClickToggleSelected(user) {
      if (!this.selectedUsers.includes(user)) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = this.selectedUsers.filter((u) => u != user);
      }
    },
  },
  computed: {
    ...mapGetters(["users"]),
    filteredUsers() {
      return this.users
        .filter((user) => {
          return user.username
            .toLowerCase()
            .includes(this.searchInput.toLowerCase());
        })
        .map((user) => ({
          user,
          selected: this.selectedUsers.includes(user),
        }));
    },
  },
};
</script>

<style src="./Community.css" scoped />
