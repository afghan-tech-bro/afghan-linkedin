import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  limit,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import linkedinService from '@/services/linkedin';
import { linkedinUser, FireState, business } from "@/types";
import { useLoading } from '@/loading'

const loading = useLoading();

const fireStore = createStore({
  state: () => {
    const state: FireState = {
      user: null,
      linkedinUser: null,
      linkedinUsers: [],
      business: null,
      businesses: [],
      messages: [],
      ideas: []
    };
    return state;
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getLinkedinUser(state) {
      return state.linkedinUser;
    },
    getAllLinkedinUsers(state) {
      return state.linkedinUsers;
    },
    getBusiness(state) {
      return state.business;
    },
    getAllBusinesses(state) {
      return state.businesses;
    },
    getMessages(state) {
      return state.messages;
    },
    getIdeas(state) {
      return state.ideas;
    },
    logged(state) : boolean {
      return Boolean(state.linkedinUser);
    },
  },
  mutations: {
    setUser: (state, user) => state.user = user,
    setLinkedinUser: (state, linkedinUser) => state.linkedinUser = linkedinUser,
    setAllLinkedinUsers: (state, linkedinUsers) => state.linkedinUsers = linkedinUsers,
    setBusiness: (state, business) => state.business = business,
    setAllBusinesses: (state, businesses) => state.businesses = businesses,
    setMessages: (state, messages) => state.messages = messages,
    setIdeas: (state, ideas) => state.ideas = ideas,
    resetState: (state) => state = {
      user: null,
      linkedinUser: null,
      linkedinUsers: [],
      business: null,
      businesses: [],
      messages: [],
      ideas: []
    },
  },
  actions: {
    setUser: ({ commit }, user) => commit('setUser', user),
    resetState: ({ commit }) => commit('resetState'),
    async setLinkedin({ commit }, code) {
      await linkedinService.getLinkedinInfo(code)
        .then((res: any) => {
          const docRef = doc(db, `users`, `${this.state.user?.uid}`)
          setDoc(docRef, {
            displayName: res.data.name,
            email: res.data.email,
            jobTitle: '',
            industry: '',
            whoCanContact: '',
            bio: '',
            profilePic: res.data.profilePic,
            linkedin: '',
            facebook: '',
            instagram: '',
            twitter: '',
            createdAt: serverTimestamp(),
          });
        })
        .catch((err: any) => {
          throw err;
        });
    },
    async updateLinkedin({ commit }, linkedinUser) {
      loading.start();
      const docRef = doc(db, `users`, `${this.state.user?.uid}`)
      updateDoc(docRef, {
        displayName: linkedinUser.displayName,
        email: linkedinUser.email,
        jobTitle: linkedinUser.jobTitle,
        industry: linkedinUser.industry,
        whoCanContact: linkedinUser.whoCanContact,
        bio: linkedinUser.bio,
        profilePic: linkedinUser.profilePic,
        linkedin: linkedinUser.linkedin,
        facebook: linkedinUser.facebook,
        twitter: linkedinUser.twitter,
        instagram: linkedinUser.instagram,
        createdAt: serverTimestamp()
      })
      .then(() => commit('setLinkedinUser', linkedinUser))
      .finally(() => loading.end());
    },
    async getLinkedin({ commit }) {
      loading.start();
      const docRef = doc(db, `users`, `${this.state.user?.uid}`)
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData: linkedinUser = {
          displayName: docSnap.data().displayName,
          email: docSnap.data().email,
          profilePic: docSnap.data().profilePic,
          jobTitle: docSnap.data().jobTitle,
          industry: docSnap.data().industry,
          whoCanContact: docSnap.data().whoCanContact,
          bio: docSnap.data().bio,
          linkedin: docSnap.data().linkedin,
          facebook: docSnap.data().facebook,
          twitter: docSnap.data().twitter,
          instagram: docSnap.data().instagram,
          createdAt: docSnap.data().createdAt,
        }
        commit('setLinkedinUser', userData);
      }
      loading.end();
    },
    async getAllLinkedinUsers({ commit }) {
      loading.start();
      let linkedinUsers: linkedinUser[] = [];
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        // @ts-ignore
        const userData: linkedinUser = {
          displayName:doc.data().displayName,
          email:doc.data().email,
          profilePic:doc.data().profilePic,
          jobTitle:doc.data().jobTitle,
          industry:doc.data().industry,
          whoCanContact:doc.data().whoCanContact,
          bio:doc.data().bio,
          linkedin:doc.data().linkedin,
          facebook:doc.data().facebook,
          twitter:doc.data().twitter,
          instagram:doc.data().instagram,
          createdAt:doc.data().createdAt,
        }
        linkedinUsers.push(userData);
      }
      commit('setAllLinkedinUsers', linkedinUsers);
      loading.end();
    },
    async updateBusiness({ commit }, business) {
      loading.start();
      const docRef = doc(db, `businesses`, `${this.state.user?.uid}`)
      updateDoc(docRef, {
        displayName: business.displayName,
        email: business.email,
        location: business.location,
        website: business.website,
        industry: business.industry,
        description: business.description,
        linkedin: business.linkedin,
        facebook: business.facebook,
        twitter: business.twitter,
        instagram: business.instagram,
        createdAt: serverTimestamp()
      })
      .then(() => commit('setBusiness', business))
      .finally(() => loading.end());
    },
    async getBusiness({ commit }) {
      if (!this.state.user) return;
      loading.start();
      let businessData: business = {
        displayName: '',
        email: '',
        website: '',
        industry: '',
        location: '',
        description: '',
        linkedin: '',
        facebook: '',
        instagram: '',
        twitter: '',
        createdAt: Timestamp.now(),
      }
      const docRef = doc(db, `businesses`, `${this.state.user?.uid}`)
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        businessData = {
          displayName: docSnap.data().displayName,
          website: docSnap.data().website,
          location: docSnap.data().location,
          email: docSnap.data().email,
          industry: docSnap.data().industry,
          description: docSnap.data().description,
          linkedin: docSnap.data().linkedin,
          facebook: docSnap.data().facebook,
          twitter: docSnap.data().twitter,
          instagram: docSnap.data().instagram,
          createdAt: docSnap.data().createdAt,
        }
      } else {
        await setDoc(docRef, businessData);
      }
      commit('setBusiness', businessData);
      loading.end();
    },
    async getAllBusinesses({ commit }) {
      loading.start();
      let businesses: business[] = [];
      const q = query(collection(db, "businesses"), orderBy("displayName", "desc"));
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        // @ts-ignore
        const businessData: business = {
          displayName: doc.data().displayName,
          website: doc.data().website,
          location: doc.data().location,
          email: doc.data().email,
          industry: doc.data().industry,
          description: doc.data().description,
          linkedin: doc.data().linkedin,
          facebook: doc.data().facebook,
          twitter: doc.data().twitter,
          instagram: doc.data().instagram,
          createdAt: doc.data().createdAt,
        }
        businesses.push(businessData);
      }
      commit('setAllBusinesses', businesses);
      loading.end();
    },
    async getMessages({ commit }) {
      loading.start();
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(100))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        for (const doc of querySnapshot.docs) {
          const message = {
            userName: doc.data().userName,
            userPhotoURL: doc.data().userPhotoURL,
            userId: doc.data().userId,
            text: doc.data().text
          }
          messages.push(message);
        }
        commit('setMessages', messages.reverse());
        loading.end();
      });
    },
    async sendMessage({ commit }, text) {
      loading.start();
      // @ts-ignore
      const { photoURL, uid, displayName } = this.state.user;

      await addDoc(collection(db, "messages"), {
        userName: displayName,
        userId: uid,
        userPhotoURL: photoURL,
        text: text,
        createdAt: serverTimestamp()
      });
      loading.end();
    },
    async getIdeas({ commit }) {
      loading.start();
      const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"), limit(100))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ideas = [];
        for (const doc of querySnapshot.docs) {
          const idea = {
            email: doc.data().email,
            userName: doc.data().userName,
            userPhotoURL: doc.data().userPhotoURL,
            userId: doc.data().userId,
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate().toString().substring(0, 15)
          }
          ideas.push(idea);
        }
        commit('setIdeas', ideas);
        loading.end();
      })
    },
    async sendIdea({ commit }, text) {
      loading.start();
      // @ts-ignore
      const { photoURL, uid, displayName, email } = this.state.user;

      await addDoc(collection(db, "ideas"), {
        email: email,
        userName: displayName,
        userId: uid,
        userPhotoURL: photoURL,
        text: text,
        createdAt: serverTimestamp()
      });
      loading.end();
    }
  },
  modules: {},
  plugins: [createPersistedState()],
});

export default fireStore;