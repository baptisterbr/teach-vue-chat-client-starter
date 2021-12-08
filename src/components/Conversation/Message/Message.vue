<template>
  <div :class="mine === true ? 'mine message' : 'message'">
    <img :title="sender" :src="url" />
    <div :class="position + ' bubble'">{{ content }}</div>
    <div class="reacts"></div>
    <div class="controls">
      <i title="Supprimer" class="circular trash icon"></i
      ><i title="Editer" class="circular edit icon"></i
      ><i title="Répondre" class="circular reply icon"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    mine: Boolean,
    sender: String,
    content: String,
    position: String,
    url: String,
  },
};
</script>

<style src="./../Conversation.css" scoped />
