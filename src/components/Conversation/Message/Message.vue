<template>
  <div :class="mine === true ? 'mine message' : 'message'">
    <img :title="sender" :src="url" />
    <div :class="position + ' bubble'">
      <p v-if="reply != null" class="reply_content">{{ reply.content }}</p>
      {{ content }}
    </div>
    <div class="reacts">
      <i
        v-for="reaction in messageReactions"
        :key="reaction.name"
        :class="'circular ' + getReactionClass(reaction.name) + ' outline icon'"
        >{{ reaction.count }}</i
      >
    </div>
    <div v-if="mine === false" class="controls">
      <i
        title="Répondre"
        class="circular reply icon"
        @click="$emit('clickReponse', message)"
      ></i>
      <span class="react">
        <i title="Aimer" class="circular heart outline icon"></i>
        <i title="Pouce en l'air" class="circular thumbs up outline icon"> </i>
        <i title="Content" class="circular smile outline icon"></i>
        <i title="Pas content" class="circular frown outline icon"> </i>
      </span>
    </div>
    <div v-else class="controls">
      <i
        title="Supprimer"
        class="circular trash icon"
        @click="$emit('clickDelete', message)"
      ></i
      ><i title="Editer" class="circular edit icon"></i
      ><i
        title="Répondre"
        class="circular reply icon"
        @click="$emit('clickReponse', message)"
      ></i>
    </div>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    message: Object,
    mine: Boolean,
    sender: String,
    content: String,
    position: String,
    url: String,
    reactions: Object,
    reply: Object,
    reponse: Function,
  },
  computed: {
    messageReactions() {
      const reactions = [];
      Object.values(this.reactions).forEach((reaction) => {
        if (reactions.find((r) => r.name === reaction) === undefined) {
          reactions.push({
            name: reaction,
            count: 1,
          });
        } else {
          const reactionToUpdate = reactions.find((r) => r.name === reaction);
          reactionToUpdate.count++;
        }
      });
      return reactions;
    },
  },
  methods: {
    getReactionClass(reaction) {
      switch (reaction.toUpperCase()) {
        case "HEART":
          return "heart";
        case "HAPPY":
          return "smile";
        case "THUMB":
          return "thumbs up";
        case "SAD":
          return "frown";
        default:
          return "";
      }
    },
  },
};
</script>

<style src="./../Conversation.css" scoped />
