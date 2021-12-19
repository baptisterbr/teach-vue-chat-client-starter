import Vue from "vue";
import Vuex from "vuex";
import router from "@/router";
import formatDate from "@/libs/date.js";

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
        awake: state.usersAvailable.includes(user.username),
      }));
    },
    conversations(state) {
      return state.conversations.map((conversation) => {
        let users = state.users.filter((user) =>
          conversation.participants.includes(user.username)
        );

        users = users.filter((u) => u.username !== state.user.username);
        const title = users.map((user) => user.username).join(", ");

        const awake = conversation.participants.some(
          (u) => state.usersAvailable.includes(u) && u !== state.user.username
        );

        const newMessage =
          conversation.seen[state.user.username] !== -1 &&
          conversation.seen[state.user.username].message_id !==
            conversation.messages[conversation.messages.length - 1].id;

        return {
          ...conversation,
          conversation_picture:
            conversation.type === "many_to_many"
              ? undefined
              : users.find((user) => user.username !== state.user.username)
                  .picture_url,
          conversation_title:
            conversation.type === "many_to_many" ? "Groupe: " + title : title,
          awake,
          new: newMessage,
        };
      });
    },
    conversation(state, getters) {
      let conv = getters.conversations.find(
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

      const messages = conv.messages.map((m) => {
        const seen = [];
        const seenKeys = Object.keys(conv.seen);
        const seenValues = Object.values(conv.seen);

        seenValues.map((item) => {
          if (item instanceof Object && item.message_id === m.id) {
            seen.push({
              name: seenKeys[seenValues.findIndex((v) => v === item)],
              time: formatDate(item.time, "medium"),
              url:
                participantsUrls[
                  seenKeys[seenValues.findIndex((v) => v === item)]
                ],
            });
          }
        });

        return { ...m, seen };
      });

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
    upsertAvailableUsers(state, { usernames }) {
      Vue.set(state, "usersAvailable", usernames);
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
    seeConv({ commit, state }, { conversation_id }) {
      console.log(conversation_id)
      const conversation = state.conversations.find(
        (conv) => conv.id === conversation_id
      );
      console.log(conversation)
      const lastMessage = conversation.messages.length ? conversation.messages[conversation.messages.length - 1] : undefined;
      if (lastMessage) {
        const promise = Vue.prototype.$client.seeConversation(
          conversation_id,
          lastMessage.id
        );
      }
    },
  },
});
