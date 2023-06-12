<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapState } from 'pinia';
import { useGeneralStore } from '../stores';
import { Principal } from '@dfinity/principal';
import {FormInst, FormItemRule, useMessage} from 'naive-ui';
// import {createActor, merchant} from '../declarations/merchant';
import {manager_actor} from '../info';
import {createActor as createMerchantActor} from '../declarations/merchant';
import { Account } from '../declarations/merchant/merchant.did';
import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import {NFID_AUTH_URL} from '../auth';

interface OrderPubForm {
    tokens: TokenLiteral[],
    // tokens: {
    //     principal: string,
    //     standard: string,
    //     amount: string
    // }[],
    payload: Uint8Array,
    payload_spec: string,
    payer: string
}

interface TokenLiteral {
    principal: string,
    standard: string,
    amount: string
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

        const message = useMessage();

        return {
            orderPubFormRef,
            orderPubFormRules,
            orderPubForm,
            message,
        }
    },
    computed: {
        ...mapState(useGeneralStore, ['principal']),
    },
    data() {
        let res: {
            merchant_id: bigint,
            merchant_principal: string,
        } = {
            merchant_id: BigInt(-1),
            merchant_principal: Principal.anonymous().toString(),
        }

        return res;
    },
    async beforeMount() {
        if(this.principal == Principal.anonymous().toString()) {
            const message = useMessage();
            message.error('not logged in');
            this.$router.push('/');
        }

        this.merchant_id = BigInt(parseInt(this.$route.params.id as string));
        let call_res = await manager_actor.get_merchant_by_id(this.merchant_id);
        if(call_res[0]) {
            this.merchant_principal = call_res[0].toString();
        }

        
        // let merchant_actor = createMerchantActor(this.merchant_principal);
    },
    methods: {
        onCreateTokenItem() {
            return {
                principal: Principal.anonymous().toString(),
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
        async publish(authClient: AuthClient) {
            let merchant_actor = createMerchantActor(this.merchant_principal, {
                agent: new HttpAgent({
                    identity: authClient.getIdentity() 
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
                Ok: bigint,
                Err: string
            };

            if(publish_res.Ok) {
                let order_id = publish_res.Ok;
                console.log(order_id);
                this.message.success(`successfully published with ${order_id}`)
            } else {
                console.log(publish_res.Err); 
            }
        },
        async publishOrder() {
            this.message.info('publishing')

            let loggedIn = true;
            const authClient = await AuthClient.create();
            if(!(await authClient.isAuthenticated())) {
                authClient.login({
                    identityProvider: NFID_AUTH_URL,
                    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
                    windowOpenerFeatures: 
                    `left=${window.screen.width / 2 - 525 / 2}, `+ 
                    `top=${window.screen.height / 2 - 705 / 2},` + 
                    `toolbar=0,location=0,menubar=0,width=525,height=705`,
                    onSuccess: async () => {
                        console.log('successfully logged in');
                        await this.publish(authClient);
                    },
                    onError: () => {
                        this.message.error('authorize error');
                        loggedIn = false;
                    }
                });
            } else {
                console.log('authencated');
                this.publish(authClient);
            }

            if(!loggedIn) {
                console.log('not logged in');
                return
            }


            

        }
    }
})

</script>

<template>
    <div>
        <n-card title="Merchant Info">
            <div>ID: {{ merchant_id }}</div>
            <div>Canister Principal: {{ merchant_principal }}</div>
        </n-card>
        <n-card title="Orders">

        </n-card>

        <n-card title="Order Publish Service">
            <n-form
                ref="orderPubFormRef"
                :label-width="80" 
                :model="orderPubForm"
                :rules="orderPubFormRules"
                :size="'large'"
            >
                <n-form-item label="payer" path="payer">
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
                        <n-input v-model:value="value.principal"></n-input>
                        <n-input v-model:value="value.standard"></n-input>
                        <n-input v-model:value="value.amount"></n-input>

                        <n-button @click="validateToken(value)">Validate</n-button>
                    </template>
                    </n-dynamic-input>
                </n-form-item>
            </n-form>
            <n-button @click="publishOrder">Publish</n-button>
        </n-card>


    </div>

</template>