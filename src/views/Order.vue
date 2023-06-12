<script lang="ts">
import { defineComponent } from 'vue';
import OrderComponent from '../components/Order.vue';

export default defineComponent({
    components: {
        OrderComponent
    },
    data() {
        let merchant_id = BigInt(this.$route.params.merchant_id as string);
        let order_id = BigInt(this.$route.params.order_id as string);

        return {
            merchant_id,
            order_id
        }
    }
})
</script>


<template>
    <OrderComponent :merchant_id="merchant_id" :order_id="order_id" />
</template>