<template>
  <div class="conversation">
    <div class="conversation-header">
      <!--      <img-->
      <!--        class="avatar"-->
      <!--        src="https://source.unsplash.com/FUcupae92P4/100x100"-->
      <!--      />-->
      <span v-if="conversation.type === 'one_to_one'"
        ><img class="avatar" :src="conversation.conversation_picture"
      /></span>
      <div class="avatar" v-else>
        <span>
          <i class="users icon"></i>
        </span>
      </div>

      <div class="title">
        <div class="ui compact">
          <i class="icon circle"></i>
          <span>{{ conversation.conversation_title }}</span>
          <div class="ui simple dropdown item">
            <i class="vertical ellipsis icon"></i>

            <div class="menu">
              <div v-if="true" class="item">
                <i class="ui icon paint brush"></i>
                Modifier le thème
              </div>
              <div v-if="true" class="item">
                <i class="ui icon edit"></i>
                Modifier le titre
              </div>
              <div v-if="true" class="item">
                <i class="ui icon volume bell slash"></i>
                Mettre en sourdine
              </div>
              <div v-if="true" class="item">
                <i class="ui icon volume bell"></i>
                Rétablir les notifications
              </div>
              <div class="item" @click="groupPanel = !groupPanel">
                <i class="ui icon users"></i>
                Gérer les participants
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="conversation-container">
      <div class="conversation-main">
        <div class="conversation-body" id="scroll">
          <div class="wrapper">
            <div v-for="message in conversation.messages" :key="message.id">
              <div class="time">{{ formatDate(message.posted_at) }}</div>
              <div
                :class="
                  message.from === user.username ? 'mine message' : 'message'
                "
              >
                <img
                  :title="message.from"
                  :src="conversation.participantsUrls[message.from]"
                />
                <div class="bubble top bottom">{{ message.content }}</div>
                <div class="reacts"></div>
                <div class="controls">
                  <i title="Supprimer" class="circular trash icon"></i
                  ><i title="Editer" class="circular edit icon"></i
                  ><i title="Répondre" class="circular reply icon"></i>
                </div>
              </div>
            </div>

            <div class="view">
              <img
                title="Vu par Alice à 01:36:39"
                src="https://source.unsplash.com/mK_sjD0FrXw/100x100"
              /><img
                title="Vu par Gael à 01:36:39"
                src="https://source.unsplash.com/OYH7rc2a3LA/100x100"
              />
            </div>
          </div>
        </div>

        <div class="typing">
          <div class="wrapper">Alice est en train d'écrire...</div>
        </div>
        <div class="conversation-footer">
          <div class="wrapper">
            <p>
              <i title="Abandonner" class="circular times small icon link"></i>
              Répondre à Alice :
              <span> On peut même éditer ou supprimer des messages ! </span>
            </p>

            <div class="ui fluid search">
              <div class="ui icon input">
                <input
                  class="prompt"
                  type="text"
                  placeholder="Rédiger un message"
                />
                <i class="send icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="conversation-sidebar" v-if="groupPanel">
        <Group />
      </div>
    </div>
  </div>
</template>

<script>
import Group from "@/components/Group/Group";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Conversation",
  components: { Group },
  data() {
    return {
      groupPanel: false,
    };
  },
  mounted() {
    this.scrollBottom();
  },
  updated() {
    this.scrollBottom();
  },
  computed: {
    ...mapGetters(["user", "conversation"]),
  },
  methods: {
    ...mapActions([]),
    scrollBottom() {
      setTimeout(() => {
        let scrollElement = document.querySelector("#scroll");
        if (scrollElement) {
          scrollElement.scrollTop =
            document.querySelector("#scroll").scrollHeight;
        }
      }, 0);
    },
    formatDate(input) {
      if (input) {
        let date = new Date(input);

        return new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(
          date
        );
      }
      return input;
    },
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    conversation(newConversation, oldConversation) {
      this.scrollBottom();
    },
  },
};
</script>

<style src="./Conversation.css" scoped />
