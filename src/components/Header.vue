<script lang="ts">
import { defineComponent } from 'vue';
import { useGeneralStore } from '../stores';
import { mapActions, mapState } from 'pinia';
import { AuthClient } from '@dfinity/auth-client';
import {NFID_AUTH_URL} from '../auth';

import { user_actor, manager_actor} from '../info';
import { Principal } from '@dfinity/principal';

export default defineComponent({
  data() {
    let res: {
      showApplyModal: boolean,
      applying: boolean,
      merchant_id: bigint | undefined,
      percentage: number 
    } = {
      showApplyModal: false,
      applying: false,
      merchant_id: undefined,
      percentage: 30
    }
    return res;
  },
  computed: {
    ...mapState(useGeneralStore, ['principal']),
  },
  methods: {
    ...mapActions(useGeneralStore, ['set_principal']),
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
          console.log(p.toString());

          let registered = await user_actor.has_user(p);
          if(!registered) {
            user_actor.register(p).then(() => {
              console.log('register successfully')
            }).catch(e => {
              console.log('register failed', e);
            });
          } else console.log('registered');

          this.set_principal(p);
        } 
      })
      Principal.anonymous()
    },
    isAnonymous(p: String): boolean {
      return Principal.anonymous().toString() == p;
    },
    async applyMerchant() {
      if(this.principal ===  Principal.anonymous().toString()) {
        return;
      }
    },
    async acceptApplication() {
      // this.showApplyModal = false;
      this.applying = true;

      const ticking_handler = setInterval(() => {
        if(this.percentage < 75) this.percentage = this.percentage += 1;
      }, 100)

      let creation_res = await manager_actor.create_merchant(Principal.fromText(this.principal));
      console.log(creation_res)

      clearInterval(ticking_handler);
    },
    async rejectApplication() {
      this.showApplyModal = false;
      this.applying = false;
      this.merchant_id = undefined;
      this.percentage = 30;
    }
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
    <div class="flex flex-row items-center space-x-3">
      <div 
        class="cursor-pointer text-purple-800" 
        @click="showApplyModal = true"
        v-if="!isAnonymous(principal)"
      >Apply Merchant</div>
      <n-modal 
        :show="showApplyModal"
        title="Merchant Application"
      >
        <n-card size="small" title="Application">
          <div class="flex flex-col space-y-3" v-if="!applying">
            <div>Are you sure to apply?</div>
            <div class="flex flex-row space-x-5">
              <n-button @click="acceptApplication" type="success" text>Submit</n-button>
              <n-button @click="rejectApplication" type="default" text>Close</n-button>
            </div>
          </div>
          <div v-else>
            <div>Creating...</div>
            <n-progress
              type="circle"
              :percentage="percentage"
              :indicator-placement="'inside'"
              processing
            >
            </n-progress>
            <n-button @click="rejectApplication" type="default" text>Close</n-button>
          </div>
        </n-card>
      </n-modal>
      <n-button 
        @click="login"
        v-if="isAnonymous(principal)"
      >Login</n-button>
      <n-button 
        @click="$router.push('/user')"
        v-else
      >Mine</n-button>
    </div>
  </div>
</template>