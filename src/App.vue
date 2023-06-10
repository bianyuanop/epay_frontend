<script lang="ts">
import { defineComponent } from 'vue'
import { manager } from './declarations/manager';
import { Principal } from '@dfinity/principal';
import { mapActions, mapState } from 'pinia';
import { useGeneralStore } from './stores';
import { AuthClient } from '@dfinity/auth-client';
import {NFID_AUTH_URL} from './auth';
// import { manager } from './declarations/manager';

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    ...mapState(useGeneralStore, ['principal'])
  },
  methods: {
    async add_manager(p: string) {
      let res = await manager.add_manager(Principal.fromText(p));
      console.log(res)
    },

    async login() {
      const authClient = await AuthClient.create();
      authClient.login({
        identityProvider: NFID_AUTH_URL,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        windowOpenerFeatures: 
          `left=${window.screen.width / 2 - 525 / 2}, `+ 
          `top=${window.screen.height / 2 - 705 / 2},` + 
          `toolbar=0,location=0,menubar=0,width=525,height=705`,
        onSuccess: async () => {
          let p = authClient.getIdentity().getPrincipal();
          this.set_principal(p);
          console.log(`successuflly logged in: ${p}`);
        } 
      })
    },

    ...mapActions(useGeneralStore, ['set_principal']),
  }
})
</script>


<template>
  <div>
    <button @click="login">Login</button> 
  </div>
</template>