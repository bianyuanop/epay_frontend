<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import { manager_actor} from '../info';
import { userAuthStore } from '../stores/auth';

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
    ...mapState(userAuthStore, ['isAuthenticated'])
  },
  methods: {
    ...mapActions(userAuthStore, ['login', 'getPrincipal']),
    login_and_register() {
      this.login();
    },
    async acceptApplication() {
      let p = await this.getPrincipal();
      if(p === undefined) {
        console.log('acceptApplication: not logged in');
        return;
      }

      this.applying = true;

      const ticking_handler = setInterval(() => {
        if(this.percentage < 75) this.percentage = this.percentage += 1;
      }, 100)

      let creation_res = await manager_actor.create_merchant(p);
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
        v-if="isAuthenticated"
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
      <n-button @click="login_and_register">Login</n-button>
      <n-button @click="$router.push('/user')" >Mine</n-button>
    </div>
  </div>
</template>