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
          <i v-if="conversation.awake" class="icon circle"></i>
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
              :key="message.posted_at"
            >
              <div
                v-if="
                  (index > 0 &&
                    conversation.messages[index - 1].from !== message.from) ||
                  index === 0
                "
                class="time"
              >
                {{ formatDate(message.posted_at, "short") }}
              </div>
              <Message
                :message="message"
                :mine="message.from === user.username"
                :position="getMessageStyle(conversation.messages, index)"
                :url="conversation.participantsUrls[message.from]"
                :reply="message.reply_to"
                @clickReponse="setReply"
                @clickDelete="delMessage"
                @clickEdit="setEdit"
              />
              <div v-if="message.seen.length" class="view">
                <img
                  v-for="item in message.seen"
                  :key="item.name"
                  :title="'Vu par ' + item.name + ' à ' + item.time"
                  :src="item.url"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="typing">
          <div class="wrapper">Alice est en train d'écrire...</div>
        </div> -->
        <div class="conversation-footer">
          <div class="wrapper">
            <p v-if="Object.keys(reply).length">
              <i
                title="Abandonner"
                class="circular times small icon link"
                @click="setReply({})"
              ></i>
              Répondre à {{ reply.from }} :
              <span> {{ reply.content }} </span>
            </p>

            <p v-else-if="Object.keys(edit).length">
              <i
                title="Abandonner"
                class="circular times small icon link"
                @click="setEdit({})"
              ></i>
              Edition
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
import formatDate from "@/libs/date.js";

export default {
  name: "Conversation",
  components: { Group, Message },
  data() {
    return {
      groupPanel: false,
      messageInput: "",
      reply: {},
      edit: {},
    };
  },
  mounted() {
    //this.scrollBottom();
  },
  updated() {
    //this.scrollBottom();
  },
  computed: {
    ...mapGetters(["user", "conversation"]),
  },
  methods: {
    ...mapActions([
      "postMessage",
      "replyMessage",
      "deleteMessage",
      "editMessage",
      "seeConv",
    ]),
    scrollBottom(force = false) {
      setTimeout(() => {
        let scrollElement = document.querySelector("#scroll");
        const { scrollHeight, clientHeight, scrollTop } =
          document.querySelector("#scroll");
        if (
          force ||
          (scrollElement &&
            scrollElement.scrollTop ===
              document.querySelector("#scroll").scrollHeight -
                document.querySelector("#scroll").clientHeight)
        ) {
          scrollElement.scrollTop =
            document.querySelector("#scroll").scrollHeight;
        }
      }, 500);
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
        if (Object.keys(this.reply).length) {
          this.replyMessage({
            conversation_id: this.conversation.id,
            message_id: this.reply.id,
            content: this.messageInput,
          });
        } else if (Object.keys(this.edit).length) {
          this.editMessage({
            conversation_id: this.conversation.id,
            message_id: this.edit.id,
            content: this.messageInput,
          });
        } else {
          this.postMessage({
            conversation_id: this.conversation.id,
            content: this.messageInput,
          });
        }

        this.messageInput = "";
        this.setReply({});
        this.setEdit({});
        this.scrollBottom(true);
      }
    },
    setReply(message) {
      this.reply = message;
    },
    delMessage(message) {
      console.log(message);
      this.deleteMessage({
        conversation_id: this.conversation.id,
        message_id: message.id,
      });
    },
    setEdit(message) {
      this.edit = message;
      this.messageInput = message.content;
    },
    formatDate,
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    conversation(newConversation, oldConversation) {
      if (newConversation.messages.length !== oldConversation.messages.length) {
        this.seeConv({
          conversation_id: newConversation.id,
        });
      }
      this.scrollBottom();
    },
  },
};
</script>

<style src="./Conversation.css" scoped />
