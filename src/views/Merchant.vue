<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useGeneralStore } from '../stores';
import { Principal } from '@dfinity/principal';
import {useMessage} from 'naive-ui';
// import {createActor, merchant} from '../declarations/merchant';
import {manager_actor} from '../info';

export default defineComponent({
    computed: {
        ...mapState(useGeneralStore, ['principal']),
    },
    data() {
        return {

        }
    },
    async beforeMount() {
        if(this.principal == Principal.anonymous().toString()) {
            const message = useMessage();
            message.error('not logged in');
            this.$router.push('/');
        }

        let merchant_0 = await manager_actor.get_merchant_by_id(BigInt(0));
        if(merchant_0[0] !== undefined) {
            let merchant = merchant_0[0];            
            console.log(merchant.toString() == this.principal.toString());
        }

    }
})

</script>

<template>

</template>