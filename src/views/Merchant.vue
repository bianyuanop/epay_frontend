<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapActions, mapState } from 'pinia';
import { Principal } from '@dfinity/principal';
import {FormInst, FormItemRule, useMessage} from 'naive-ui';
// import {createActor, merchant} from '../declarations/merchant';
import {manager_actor} from '../info';
import {createActor as createMerchantActor} from '../declarations/merchant';
import { Account } from '../declarations/merchant/merchant.did';
import { HttpAgent, Identity } from '@dfinity/agent';
import { userAuthStore } from '../stores/auth';

interface OrderPubForm {
    tokens: TokenLiteral[],
    payload: Uint8Array,
    payload_spec: string,
    payer: string
}

interface TokenLiteral {
    principal: string,
    standard: string,
    amount: string
}

interface BalanceLiteral {
    principal: string,
    balance: bigint,
    standard: string
}

export default defineComponent({
    setup() {
        const orderPubFormRef = ref<FormInst | null>(null);
        const orderPubFormRules = {
            tokens: {
                required: true,
                validator: (_: FormItemRule, value: {
                    principal: string,
                    standard: string,
                    amount: string
                }) => {
                    return new Promise<void>((resolve, reject) => {
                        if(!Principal.from(value.principal)._isPrincipal) {
                            reject(Error('not a valid principal'));
                        } else {
                            resolve()
                        }
                    })
                }
            },
            payload: {
                required: false,
            },
            payload_spec: {
                required: false,
            },
            payer: {
                require: true,
                trigger: ['input'],
                validator: (_: FormItemRule, value: string) => {
                    return new Promise<void>((resolve, reject) => {
                        if(!Principal.fromText(value)._isPrincipal) {
                            reject(Error('not a valid principal'));
                        } else {
                            resolve()
                        }
                    })
                }
            }
        }
        const orderPubForm = ref({
            tokens: [{
                principal: Principal.anonymous().toString(),
                standard: "DIP20",
                amount: "1000000000",
            }],
            payload: new Uint8Array(),
            payload_spec: 'unknown',
            payer: Principal.anonymous().toString(),
        } as OrderPubForm)

        const balanceColumns = [
            {
                title: 'Principal',
                key: 'principal'
            },
            {
                title: 'Standard',
                key: 'standard'
            },
            {
                title: 'Amount',
                key: 'balance'
            },
        ]

        const message = useMessage();

        return {
            orderPubFormRef,
            orderPubFormRules,
            orderPubForm,
            message,
            balanceColumns
        }
    },
    computed: {
        ...mapState(userAuthStore, ['isAuthenticated']),
    },
    data() {
        let res: {
            merchant_id: bigint,
            merchant_principal: string,
            publish_disbaled: boolean,
            order_published: bigint[],
            orders_on_hold: bigint[],
            balance: BalanceLiteral[],
            allowed_tokens: string[],
        } = {
            merchant_id: BigInt(-1),
            merchant_principal: Principal.anonymous().toString(),
            publish_disbaled: false,
            order_published: [],
            orders_on_hold: [],
            balance: [],
            allowed_tokens: []
        }

        return res;
    },
    async beforeMount() {
        if(!this.isAuthenticated) {
            const message = useMessage();
            message.error('not logged in');
            this.$router.push('/');
        }

        this.merchant_id = BigInt(parseInt(this.$route.params.id as string));
        let call_res = await manager_actor.get_merchant_by_id(this.merchant_id);
        console.log(this.merchant_id);
        if(call_res[0] === undefined) {
            return;
        }

        this.merchant_principal = call_res[0].toString();
        console.log(this.merchant_principal);

        let identity = await this.getIdentity();
        let agent: HttpAgent | undefined;
        if(identity) {
            agent = new HttpAgent({
                identity,
            }); 
        } else {
            agent = undefined;
        }

        let merchant_actor = createMerchantActor(this.merchant_principal, {
            agent
        });

        let merchant_info = await merchant_actor.get_merchant_info();
        console.log(merchant_info);

        merchant_info.conf.token_allowed
        
        for(let token of merchant_info.conf.token_allowed) {
            this.allowed_tokens.push(token.principal.toString());
        }

        let balance = merchant_info.balance.token_balances;
        for(let token of balance) {
            let item: BalanceLiteral = {
                principal: token[0].toString(),
                balance: token[1].balance,
                standard: Object.keys(token[1].token_info.token_type)[0],
            }

            this.balance.push(item)
        }

        let on_hold_orders = await merchant_actor.get_on_hold_orders();
        this.orders_on_hold = on_hold_orders as bigint[];
        console.log(on_hold_orders);
    },
    methods: {
        ...mapActions(userAuthStore, ['getIdentity', 'isRealAuthenticated']),
        onCreateTokenItem() {
            return {
                principal: "",
                amount: "10000000000",
                standard: "DIP20",
            }
        },
        validateToken(token: TokenLiteral) {
            try {
                Principal.from(token.principal);
                this.message.success('valid');
            } catch {
                this.message.warning('not a valid principal');
            }
        },
        async publish(identity: Identity) {
            let merchant_actor = createMerchantActor(this.merchant_principal, {
                agent: new HttpAgent({
                    identity,
                })
            });

            let token_principals = new Array<Principal>();
            let token_standards = new Array<string>();
            let token_amounts = new Array<bigint>();
            for(let token of this.orderPubForm.tokens) {
                token_principals.push(Principal.from(token.principal));
                token_standards.push(token.standard);
                token_amounts.push(BigInt(token.amount));
            }

            let payload: [] = [];
            let payload_spec: [] = [];
            let payer: Account = {owner: Principal.from(this.orderPubForm.payer), subaccount: []};

            let publish_res = await merchant_actor.publish_order(token_principals, token_standards, token_amounts, payload, payload_spec, payer) as {
                Ok: bigint | undefined,
                Err: string | undefined
            };

            console.log(publish_res)

            if(publish_res.Ok !== undefined) {
                let order_id = publish_res.Ok;
                this.order_published.push(order_id);
                this.orders_on_hold.push(order_id);
                console.log(order_id);
                this.message.success(`successfully published order with ID: ${order_id}`)
            } else {
                console.log(publish_res.Err); 
                this.message.error('failed to publish order' + publish_res.Err)
            }
        },
        async publishOrder() {
            this.publish_disbaled = true;
            let identity = this.getIdentity();

            if(this.isAuthenticated && identity) {
                await this.publish(identity);
            } else {
                this.message.error('not logged in');
            }

            this.publish_disbaled = false;
        },
        tokenOptions() {
            let res = [];
            for(let token of this.allowed_tokens) {
                res.push({
                    label: token,
                    value: token
                })
            }

            return res;
        }
    },
})

</script>

<template>
    <div class="mt-3 mb-3">
        <n-gradient-text type="info">
            <div class="text-4xl">
                MERCHANT
            </div>
        </n-gradient-text>  
    </div>
    <div> 
        <n-card title="Merchant Info">
            <div>ID: {{ merchant_id }}</div>
            <div>Canister Principal: {{ merchant_principal }}</div>
        </n-card>
        <n-card title="balance">
            <n-data-table :columns="balanceColumns" :data="balance"></n-data-table>
        </n-card>
        <n-card title="Orders Just Published">
            <n-list hoverable v-if="order_published.length > 0">
                <div v-for="order_id in order_published">
                    <n-list-item
                        class="cursor-pointer"
                        @click="$router.push(`/order/${merchant_id}/${order_id}`)"
                    >
                        {{ order_id }}
                    </n-list-item> 
                </div>
            </n-list>
            <div v-else>Empty</div>
        </n-card>

        <n-card title="Order Publish Service">
            <n-form
                ref="orderPubFormRef"
                :label-width="80" 
                :model="orderPubForm"
                :rules="orderPubFormRules"
                :size="'large'"
            >
                <n-form-item label="payer(if not known in advance just leave it be anonymous)" path="payer">
                    <n-input v-model:value="orderPubForm.payer" placeholder="payer principal's here"></n-input>
                </n-form-item>
                <n-form-item label="tokens" path="tokens">
                    <n-dynamic-input 
                        v-model:value="orderPubForm.tokens"
                        :min="1"
                        :max="6"
                        :on-create="onCreateTokenItem"
                    >
                    <template #default="{value}">
                        <!-- <n-input v-model:value="value.principal"></n-input> -->
                        <n-select 
                            v-model:value="value.principal" 
                            :options="tokenOptions()"
                            placeholder="select one token"
                        ></n-select>
                        <n-input v-model:value="value.standard"></n-input>
                        <n-input v-model:value="value.amount"></n-input>

                        <n-button @click="validateToken(value)">Validate</n-button>
                    </template>
                    </n-dynamic-input>
                </n-form-item>
            </n-form>
            <n-button 
                @click="publishOrder"
                :disabled="publish_disbaled"
            >Publish</n-button>
        </n-card>

        <n-card title="Orders on Hold">
            <n-list hoverable v-if="orders_on_hold.length > 0">
                <div v-for="order_id in orders_on_hold">
                    <n-list-item
                        class="cursor-pointer"
                        @click="$router.push(`/order/${merchant_id}/${order_id}`)"
                    >
                        {{ order_id }}
                    </n-list-item> 
                </div>
            </n-list>
            <div v-else>No order on hold</div>
        </n-card>
    </div>

</template>