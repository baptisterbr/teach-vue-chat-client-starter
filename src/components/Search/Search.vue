<template>
  <div class="search-message">
    <div class="filter">
      <div class="ui fluid search">
        <div class="ui icon input">
          <input
            v-model="searchInput"
            @input="handleChangeInput"
            class="prompt"
            type="text"
            placeholder="Rechercher un message"
          />
          <i class="search icon"></i>
        </div>
        <div class="results"></div>
      </div>
    </div>
    <div class="conversations">
      <div
        v-for="conversation in matchingConversations"
        :key="conversation.id"
        class="conversation"
      >
        <div class="author">
          <template v-if="conversation.type === 'one_to_one'">
            <img :src="conversation.conversation_picture" />
            <span>{{ conversation.conversation_title }}</span>
          </template>
          <template v-else>
            <div class="avatar">
              <i class="users icon"></i>
            </div>
            <span>{{ conversation.conversation_title }}</span>
          </template>
        </div>
        <div class="messages">
          <div
            v-for="message in conversation.matching_messages"
            :key="message.id"
            class="message"
          >
            <div class="time">
              {{ formatDate(message.posted_at, "medium") }}
            </div>
            <div class="bubble">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="conversation" v-for="x in 10" :key="x">
        <div class="author">
          <template v-if="x % 2">
            <img src="https://source.unsplash.com/7YVZYZeITc8/100x100" />
            <span>Bob</span>
          </template>
          <template v-else>
            <div class="avatar">M</div>
            <span>Groupe : METINET</span>
          </template>
        </div>
        <div class="messages" v-for="y in 3" :key="y">
          <div class="message">
            <div class="time">14/07/2020 13:37</div>
            <div class="bubble">
              Blah blah blah blah blah blah blah blah blah blah blah blah blah
              blah blah blah blah blah blah blah blah blah blah blah blah blah
              blah
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import formatDate from "@/libs/date.js";

export default {
  name: "Search",
  data() {
    return {
      searchInput: "",
      matchingConversations: [],
    };
  },
  computed: {
    ...mapGetters(["conversations"]),
  },
  methods: {
    async handleChangeInput() {
      const matchConversations = await this.$client.searchMessage(
        this.searchInput
      );
      this.matchingConversations = matchConversations.conversations.map(
        (matchConversation) => {
          const currentConversation = this.conversations.find(
            (conversation) => conversation.id === matchConversation.id
          );
          return {
            ...matchConversation,
            conversation_picture: currentConversation.conversation_picture,
            conversation_title: currentConversation.conversation_title,
          };
        }
      );
    },
    formatDate,
  },
};
</script>

<style src="./Search.css" scoped />
