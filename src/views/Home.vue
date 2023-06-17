<script lang="ts">
import { useMessage } from 'naive-ui';
import { mapState, mapActions } from 'pinia';
import { defineComponent } from 'vue';
import { userAuthStore } from '../stores/auth';

export default defineComponent({
    setup() {
        const message = useMessage();
        return {
            message
        }
    },
    computed: {
        ...mapState(userAuthStore, ['isAuthenticated']),
    },
    methods: {
        ...mapActions(userAuthStore, ['login']),
        applyMerchant() {

        }
    }
})
</script>

<template>
    <div>
        <n-card title="Payment flow">
            <n-steps vertical>
                <n-step title="Login" description="Login by clicking the login button at the top right corner" />
                <n-step title="Apply Merchant" description="After logining, there will be a purple 'apply merchant' button at the top right corner, you can click apply merchant to host a merchant canister for your own business" />
                <n-step title="Manage Your Stores" description="By clicking the 'Mine' button that direct you to the page where you can find the merchant section. In that section, by clicking the merchant number the system assign you, you will be directed to the merchant panel of the store" />
                <n-step title="Publish Order" description="Select supported token, amount of token of the order, then publish an order for payer to pay" />
                <n-step title="Pay Order" description="After publishing order, the published order order can be found in the 'Orders Just Published' Section, where you can click the order id, then it will dierct you to the page of order." />
            </n-steps>
        </n-card>
    </div>
</template>