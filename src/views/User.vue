<script lang="ts">
import { defineComponent, h } from 'vue';
import { mapActions, mapState } from 'pinia';
import {NButton} from 'naive-ui';
// import {createActor, merchant} from '../declarations/merchant';
// import {manager_actor} from '../info';
import {user_actor} from '../info';
import { OrderBrief } from '../declarations/user/user.did';
import { userAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
// import { User } from '../declarations/user/user.did.d';
export default defineComponent({
    setup() {
        const router = useRouter();
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
                {
                    title: 'Action',
                    key: 'action',
                    render(row: {merchant_id: bigint, order_id: bigint}) {
                        return h(
                            NButton,
                            {
                                strong: true,
                                tertiary: true,
                                size: 'small',
                                onClick: () => router.push(`/order/${row.merchant_id}/${row.order_id}`)
                            },
                            { default: () => 'Detail' }
                        )
                    }
                }
            ]
        }
    },
    computed: {
        ...mapState(userAuthStore, ['isAuthenticated']),
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
        let p = this.getPrincipal();
        console.log(p);
        if(!this.isAuthenticated || p === undefined) {
            this.$router.push('/');

            return;
        }

        if(!await this.hasUser()) {
            await user_actor.register(p);
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
        ...mapActions(userAuthStore, ['getPrincipal']),
        async getUser() {
            let p = this.getPrincipal();
            if(p) {
                let user = await user_actor.get_user(p);
                return user[0]
            } else return undefined;
        },
        async hasUser() {
            let p = this.getPrincipal();
            if(p) {
                let has = await user_actor.has_user(p);
                return has;
            } else return false;
        },
    }
})
</script>

<template>
    <div class="mt-3 mb-3">
        <n-gradient-text type="info">
            <div class="text-4xl">
                USER
            </div>
        </n-gradient-text>  
    </div>
    <n-space vertical>
        <n-card title="ID">{{ getPrincipal() }}</n-card>
        <n-card title="Principal">{{ id }}</n-card>
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
                <n-list hoverable clickable v-for="merchant in merchants">
                    <n-list-item @click="$router.push('/merchant/' + String(merchant))">
                        <n-thing :title="String(merchant)"></n-thing>
                    </n-list-item>
                </n-list>
            </div>
            <div v-else>
                Not having any stores
            </div>
        </n-card>
    </n-space>
</template>