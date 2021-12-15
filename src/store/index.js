import Vue from "vue";
import Vuex from "vuex";
import router from "@/router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authenticating: false,
    user: {
      username: null,
      token: null,
      picture_url: null,
    },
    users: [],
    conversations: [],
    currentConversationId: null,
    usersAvailable: [],
  },
  getters: {
    authenticating(state) {
      return state.authenticating;
    },
    authenticated(state) {
      return state.user.token !== null;
    },
    user(state) {
      return state.user;
    },
    users(state) {
      return state.users.map((user) => ({
        ...user,
        //TODO
      }));
    },
    conversations(state) {
      return state.conversations.map((conversation) => {
        let users = state.users.filter((user) =>
          conversation.participants.includes(user.username)
        );

        users = users.filter((u) => u.username !== state.user.username);
        const title = users.map((user) => user.username).join(", ");

        return {
          ...conversation,
          conversation_picture:
            conversation.type === "many_to_many"
              ? undefined
              : users.find((user) => user.username !== state.user.username)
                  .picture_url,
          conversation_title:
            conversation.type === "many_to_many" ? "Groupe: " + title : title,
        };
      });
    },
    conversation(state, getters) {
      let conv = state.conversations.find(
        (c) => c.id === state.currentConversationId
      );

      let users = state.users.filter((user) =>
        conv.participants.includes(user.username)
      );

      const participantsUrls = {};

      users.forEach((user) => {
        participantsUrls[user.username] = user.picture_url;
      });

      users = users.filter((u) => u.username !== state.user.username);

      const title = users.map((user) => user.username).join(", ");

      const messages = conv.messages.map((m) => m);

      return {
        ...conv,
        conversation_picture:
          conv.type === "many_to_many"
            ? undefined
            : users.find((user) => user.username !== state.user.username)
                .picture_url,
        conversation_title:
          conv.type === "many_to_many" ? "Groupe: " + title : title,
        participantsUrls,
        messages: messages,
      };
    },
  },
  mutations: {
    syncCurrentConversation(state, conversationId) {
      state.currentConversationId = conversationId;
    },
    setAuthenticating(state, authenticating) {
      state.authenticating = authenticating;
    },
    setUser(state, { username, token, picture_url }) {
      Vue.set(state.user, "username", username);
      Vue.set(state.user, "token", token);
      Vue.set(state.user, "picture_url", picture_url);
    },
    setUsers(state, users) {
      state.users = users;
    },

    setConversations(state, conversations) {
      state.conversations = conversations;
    },

    upsertUser(state, { user }) {
      const localUserIndex = state.users.findIndex(
        (_user) => _user.username === user.username
      );

      if (localUserIndex !== -1) {
        Vue.set(state.users, localUserIndex, user);
      } else {
        state.users.push({
          ...user,
        });
      }
    },

    upsertConversation(state, { conversation }) {
      const localConversationIndex = state.conversations.findIndex(
        (conv) => conv.id === conversation.id
      );

      if (localConversationIndex !== -1) {
        Vue.set(state.conversations, localConversationIndex, conversation);
      } else {
        state.conversations.push({
          ...conversation,
        });
      }

      state.conversations = state.conversations.filter((conversation) =>
        conversation.participants.includes(state.user.username)
      );
    },
    upsertMessage(state, { conversation_id, message }) {
      const conv = state.conversations.find((c) => c.id === conversation_id);

      const messageIndex = conv.messages.findIndex((m) => m.id === message.id);

      if (messageIndex !== -1) {
        Vue.set(conv.messages, messageIndex, message);
      } else {
        conv.messages.push({ ...message });
      }
    },
    deleteMessage(state, { conversation_id, message_id }) {
      const conv = state.conversations.find((c) => c.id === conversation_id);

      const messageIndex = conv.messages.findIndex(
        (message) => message.id === message_id
      );

      const message = conv.messages[messageIndex];

      message.deleted = true;

      if (messageIndex !== -1) {
        Vue.set(conv.messages, messageIndex, message);
      }

      // if (message != null) {
      //   Vue.set(
      //     conv.messages,
      //     conv.messages.findIndex((m) => (m.id = message_id)),
      //     message
      //   );
      // }

      state.conversations = state.conversations.filter((conversation) =>
        conversation.participants.includes(state.user.username)
      );
    },
  },
  actions: {
    authenticate({ commit, dispatch }, { username, password }) {
      if (!username || !password) {
        return;
      }
      commit("setAuthenticating", true);
      Vue.prototype.$client
        .authenticate(username, password)
        .then((user) => {
          commit("setUser", user);
          localStorage.setItem("username", username);
          localStorage.setItem("password", password);

          dispatch("initializeAfterAuthentication");
        })
        .catch(() => {
          alert("Erreur d'authentification !");
        })
        .finally(() => {
          commit("setAuthenticating", false);
        });
    },

    deauthenticate() {
      localStorage.removeItem("password");
      window.location.reload();
    },

    initializeAfterAuthentication({ dispatch }) {
      dispatch("fetchUsers");
      dispatch("fetchConversations");
    },

    fetchUsers({ commit }) {
      Vue.prototype.$client.getUsers().then(({ users }) => {
        commit("setUsers", users);
      });
    },

    fetchConversations({ commit }) {
      Vue.prototype.$client.getConversations().then(({ conversations }) => {
        commit("setConversations", conversations);
      });
    },

    createOneToOneConversation({ commit }, username) {
      const promise = Vue.prototype.$client.getOrCreateOneToOneConversation(
        username
      );

      promise.then(({ conversation }) => {
        router.push({
          name: "Conversation",
          params: { id: conversation.id },
        });
      });

      return promise;
    },

    createManyToManyConversation({ commit }, usernames) {
      const promise = Vue.prototype.$client.createManyToManyConversation(
        usernames
      );

      promise.then(({ conversation }) => {
        router.push({
          name: "Conversation",
          params: { id: conversation.id },
        });
      });

      return promise;
    },
    postMessage({ commit }, { conversation_id, content }) {
      const promise = Vue.prototype.$client.postMessage(
        conversation_id,
        content
      );
    },
    addParticipant({ commit }, { conversation_id, username }) {
      const promise = Vue.prototype.$client.addParticipant(
        conversation_id,
        username
      );
    },
    removeParticipant({ commit }, { conversation_id, username }) {
      const promise = Vue.prototype.$client.removeParticipant(
        conversation_id,
        username
      );
    },
    replyMessage({ commit }, { conversation_id, message_id, content }) {
      const promise = Vue.prototype.$client.replyMessage(
        conversation_id,
        message_id,
        content
      );
    },
    deleteMessage({ commit }, { conversation_id, message_id }) {
      console.log("deleting message");
      const promise = Vue.prototype.$client.deleteMessage(
        conversation_id,
        message_id
      );
    },
    editMessage({ commit }, { conversation_id, message_id, content }) {
      console.log("editing message");
      const promise = Vue.prototype.$client.editMessage(
        conversation_id,
        message_id,
        content
      );
    },
  },
});
