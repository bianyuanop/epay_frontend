<script lang="ts">
import { defineComponent } from 'vue';
import { useGeneralStore } from '../stores';
import { mapActions } from 'pinia';
import { AuthClient } from '@dfinity/auth-client';
import {NFID_AUTH_URL} from '../auth';

import { user_actor } from '../info';

export default defineComponent({
  methods: {
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

          user_actor.register(p).then(() => {
            console.log('register successuflly');
          });
        } 
      })
    },
    ...mapActions(useGeneralStore, ['set_principal']),
  }
  
})
</script>

<template>
  <div class="flex p-4 justify-between shadow-md items-center">
    <n-gradient-text
      class="text-lg"
      gradient="linear-gradient(90deg, red 0%, green 50%, blue 100%)"
      @click="$router.push('/')"
    >ePay</n-gradient-text>
    <n-button @click="login">Login</n-button>
  </div> 
</template>