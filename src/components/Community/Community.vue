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

    <div v-if="selectedUsers.length" class="actions">
      <button class="ui primary big button" @click="openConversation">
        <i class="conversation icon"></i>
        <span v-if="!openingConversation">
          Ouvrir la conversation ({{ selectedUsers.length }})
        </span>
        <span v-else>Ouverture de la conversation...</span>
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
      openingConversation: false,
    };
  },
  methods: {
    ...mapActions([
      "createOneToOneConversation",
      "createManyToManyConversation",
    ]),
    openConversation() {
      let promise;

      this.openingConversation = true;

      if (this.selectedUsers.length === 1) {
        promise = this.createOneToOneConversation(
          this.selectedUsers[0].username
        );
      } else {
        promise = this.createManyToManyConversation(
          this.selectedUsers.map((user) => user.username)
        );
      }

      promise.finally(() => {
        this.openingConversation = false;
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
    ...mapGetters(["users", "user"]),
    filteredUsers() {
      return this.users
        .filter((user) => {
          return (
            user.username
              .toLowerCase()
              .includes(this.searchInput.toLowerCase()) &&
            user.username !== this.user.username
          );
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
