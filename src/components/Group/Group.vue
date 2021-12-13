<template>
  <div class="group">
    <div class="ui fluid search">
      <div class="ui icon input">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Rechercher un utilisateur"
          class="prompt"
        /><i class="search icon"></i>
      </div>
    </div>
    <div class="spanner">
      <hr />
      <span>Participants</span>
      <hr />
    </div>
    <div
      v-for="participant in participants"
      :key="participant.username"
      class="user"
    >
      <img :src="participant.picture_url" /><span
        ><br />{{ participant.username }}<i class="nickname"></i></span
      ><i title="Modifier le surnom" class="circular quote left link icon"></i
      ><i
        @click="clickRemoveParticipant(participant.username)"
        title="Enlever de la conversation"
        class="circular times icon link"
        style=""
      ></i>
    </div>
    <div class="spanner">
      <hr />
      <span>Communauté</span>
      <hr />
    </div>
    <div v-for="user in community" :key="user.username" class="user">
      <img :src="user.picture_url" /><span>{{ user.username }}</span
      ><i
        title="Ajouter à la conversation"
        class="circular plus icon link"
        @click="clickAddParticipant(user.username)"
      ></i>
    </div>
  </div>
</template>

<script>
import router from "@/router";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Group",
  data() {
    return {
      searchInput: "",
    };
  },
  computed: {
    ...mapGetters(["conversation", "users", "user"]),
    filteredUsers() {
      return this.users.filter((user) => {
        return user.username
          .toLowerCase()
          .includes(this.searchInput.toLowerCase());
      });
    },
    community() {
      console.log("community");
      const communityArray = [];
      this.filteredUsers.map((user) => {
        if (
          this.conversation.participants.find((u) => u === user.username) ==
          null
        ) {
          communityArray.push(user);
        }
      });
      return communityArray;
    },
    participants() {
      console.log("participants");
      const participantsArray = [];
      this.filteredUsers.map((user) => {
        if (
          this.conversation.participants.find((u) => u === user.username) !=
          null
        ) {
          participantsArray.push(user);
        }
      });
      return participantsArray;
    },
  },
  methods: {
    ...mapActions(["addParticipant", "removeParticipant"]),
    clickAddParticipant(username) {
      this.addParticipant({ conversation_id: this.conversation.id, username });
    },
    clickRemoveParticipant(username) {
      this.removeParticipant({
        conversation_id: this.conversation.id,
        username,
      });
      if (username === this.user.username) {
        router.push({ name: "Community" });
      }
    },
  },
};
</script>

<style src="./Group.css" scoped />
