import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/services/firebase';
import fireStore from '@store/fire';

type AuthState = {
  user: null | User;
};


const authStore = createStore({
  state: () => {
    const state: AuthState = {
      user: null,
    };
    return state;
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    logged(state) : boolean {
      return Boolean(state.user);
    },
  },
  mutations: {},
  actions: {
    init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (updatedUser) => {
          if (updatedUser) {
            this.state.user = updatedUser;
            fireStore.dispatch('getCount');
          } else {
            this.state.user = null;
            resolve(null);
          };
        });
      });
    },
    async register({ commit }, { displayName, email, password }) {
      await createUserWithEmailAndPassword(auth, email, password)
      .then((res) => {
        const user = res.user;
        if (user) {
          this.state.user = user;
          updateProfile(user, {
            displayName: displayName
          }).then(() => {
            fireStore.dispatch('registerUser', user)
          })
        }
      })
      .catch((err) => {
        alert(err.message);
      })
    },
    async login({ commit }, { email, password }) {
      await signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        if (res.user) {
          this.state.user = res.user;
        } else {
          this.state.user = null;
        }
        fireStore.dispatch('setUser', res.user)
      })
      .catch((err) => {
        alert(err.message)
      })
    },
    async loginWithPopup() {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },
    async logout() {
      await signOut(auth);
    },
  },
  modules: {},
  plugins: [createPersistedState()],
});

export default authStore;
