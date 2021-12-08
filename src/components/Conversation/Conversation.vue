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
            <div
              v-for="(message, index) in conversation.messages"
              :key="message.id"
            >
              <div
                v-if="
                  (index > 0 &&
                    conversation.messages[index - 1].from !== message.from) ||
                  index === 0
                "
              >
                <div class="time">{{ formatDate(message.posted_at) }}</div>
                <Message
                  :mine="message.from === user.username"
                  :sender="message.from"
                  :content="message.content"
                  :position="getMessageStyle(conversation.messages, index)"
                  :url="conversation.participantsUrls[message.from]"
                />
              </div>
              <Message
                v-else
                :mine="message.from === user.username"
                :sender="message.from"
                :content="message.content"
                :position="getMessageStyle(conversation.messages, index)"
                :url="conversation.participantsUrls[message.from]"
              />
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
                  v-model="messageInput"
                  class="prompt"
                  type="text"
                  placeholder="Rédiger un message"
                  @keypress.enter="sendMessage"
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
import Message from "./Message/Message.vue";

export default {
  name: "Conversation",
  components: { Group, Message },
  data() {
    return {
      groupPanel: false,
      messageInput: "",
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
    ...mapActions(["postMessage"]),
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
    getMessageStyle(messages, id) {
      if (
        messages != null &&
        id != null &&
        messages.length >= id &&
        messages.length > 1
      ) {
        const currentMessage = messages[id];
        if (id > 0 && id < messages.length - 1) {
          const previousMessage = messages[id - 1];
          const nextMessage = messages[id + 1];
          if (
            previousMessage.from === currentMessage.from &&
            currentMessage.from === nextMessage.from
          ) {
            return "middle";
          } else if (previousMessage.from !== currentMessage.from) {
            return "top";
          } else {
            return "bottom";
          }
        } else {
          if (id === 0) {
            return "top";
          } else {
            return "bottom";
          }
        }
      } else {
        return "top bottom";
      }
    },
    sendMessage() {
      if (this.messageInput) {
        console.log(this.conversation, this.messageInput);
        this.postMessage({
          conversation_id: this.conversation.id,
          content: this.messageInput,
        });
        this.messageInput = "";
      }
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
