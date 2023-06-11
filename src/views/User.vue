<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useGeneralStore } from '../stores';
import { Principal } from '@dfinity/principal';
import {useMessage} from 'naive-ui';
// import {createActor, merchant} from '../declarations/merchant';
// import {manager_actor} from '../info';
import {user_actor} from '../info';
import { OrderBrief } from '../declarations/user/user.did';
// import { User } from '../declarations/user/user.did.d';
export default defineComponent({
    setup() {
        return {
            columns: [
                {
                    title: 'Merchant ID',
                    key: 'merchant_id',
                },
                {
                    title: 'Order ID',
                    key: 'order_id',
                },
            ]
        }
    },
    computed: {
        ...mapState(useGeneralStore, ['principal']),
    },
    data() {
        let res: {
            id: bigint | undefined,
            username: string | undefined,
            blocked: boolean | undefined,
            orders: OrderBrief[] | undefined,
            merchants: BigUint64Array | bigint[] | undefined,
        } = {
            id: undefined,
            username: undefined,
            blocked: undefined,
            orders: [],
            merchants: []
        };
        return res;
    },
    async beforeMount() {
        if(this.principal == Principal.anonymous().toString()) {
            const message = useMessage();
            message.error('not logged in');
            this.$router.push('/');
        }

        let user = await this.getUser();
        this.id = user?.id
        this.blocked = user?.blocked;
        this.orders = user?.orders;
        // this.orders = [
        //     {
        //         merchant_id: BigInt(0),
        //         order_id: BigInt(10)
        //     }
        // ]
        this.merchants = user?.merchants;
        // this.merchants = [ BigInt(1), BigInt(2) ]
    },
    methods: {
        async getUser() {
            let user = await user_actor.get_user(Principal.fromText(this.principal));
            return user[0]
        }
    }

})
</script>

<template>
    <h1>User</h1>
    <n-space vertical>
        <n-card title="ID">{{ id }}</n-card>
        <n-card title="Status">{{ blocked?"Blocked":"Normal" }}</n-card>
        <n-card title="Orders">
            <div v-if="orders !== undefined && orders.length > 0">
                <n-data-table :columns="columns" :data="orders"></n-data-table>
            </div>
            <div v-else>
                Empty
            </div>
        </n-card>
        <n-card title="My Stores">
            <div v-if="merchants !== undefined && merchants.length > 0">
                <n-space vertical v-for="merchant in merchants">
                    <n-card>{{ merchant }}</n-card>
                </n-space>
            </div>
            <div v-else>
                Not having any stores
            </div>
        </n-card>
    </n-space>


    <n-button @click="getUser">query</n-button>
</template>