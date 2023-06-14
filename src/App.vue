<script lang="ts" setup>
import { userAuthStore } from './stores/auth';

const authStore = userAuthStore();
const { isReady } = storeToRefs(authStore);

if (isReady.value === false) {
  authStore.init();
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { manager } from './declarations/manager';
import { Principal } from '@dfinity/principal';
import { manager_actor } from './info';
import Header from './components/Header.vue';
import { storeToRefs } from 'pinia';
// import { manager } from './declarations/manager';

export default defineComponent({
  components: {
    Header
  },
  data() {
    return {}
  },
  methods: {
    async add_manager(p: string) {
      let res = await manager.add_manager(Principal.fromText(p));
      console.log(res)
    },

    async get_merchant_by_id(id: bigint) {
      let query_res = await manager_actor.get_merchant_by_id(id);
      return query_res[0]
    },
  }
})
</script>

<template>
  <n-dialog-provider>
  <n-message-provider>
    <div class="container mx-auto">
      <div class="header">
        <Header /> 
      </div> 

      <RouterView></RouterView>
    </div>
  </n-message-provider>
  </n-dialog-provider>
  
</template>