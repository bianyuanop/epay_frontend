<!-- <script lang="ts" setup>
const props = defineProps<{
    merchant_id: bigint,
    order_id: bigint,
}>();

const message = useMessage();

defineExpose({
    message
})

console.log(props);

</script> -->


<script lang="ts">
import { defineComponent, } from 'vue';
import { createActor as createManagerActor } from '../declarations/merchant';
import { Account } from '../declarations/merchant/merchant.did.d';
import { manager_actor } from '../info';
import { Order } from '../declarations/merchant/merchant.did';
import { Principal } from '@dfinity/principal';
import { mapActions, mapState } from 'pinia';
import { userAuthStore } from '../stores/auth';
import { useMessage } from 'naive-ui';
import { createActor as createTokenActor } from '../declarations/token';
import { createActor as createMerchantActor } from '../declarations/merchant';
import { HttpAgent } from '@dfinity/agent';

interface CommentLiteral {
    payload_spec: string
    issuer: string,
    timestamp: string,
    payload: number[]
}

interface TokenLiteral {
    principal: string,
    token_type: string,
    amount: bigint
}

export default defineComponent({
    props: ['merchant_id', 'order_id'],
    setup(props: {
        merchant_id: bigint,
        order_id: bigint,
    }) {
        const message = useMessage();

        return {
            props,
            message
        } 
    },
    computed: {
        ...mapState(userAuthStore, ['isAuthenticated']),
    },
    methods: {
        ...mapActions(userAuthStore, ['getIdentity']),

        async approve_and_pay() {

            const approveNPay = async () => {
                const identity = await this.getIdentity();
                if(identity === null) {
                    this.message.error('error getting identity');
                    return;
                }

                let agent = new HttpAgent({
                    identity
                });

                for(let token of this.tokens_needed) {
                    if(token.token_type.toUpperCase() === "DIP20") {
                        try {
                            let token_actor = createTokenActor(token.principal, {
                                agent
                            });
                            let approve_res = await token_actor.approve(Principal.fromText(this.merchant_principal), token.amount) as {
                                Ok: bigint | undefined,
                                Err: {[key:string]: null} | undefined
                            };

                            if(approve_res.Ok === undefined) {
                                if(approve_res.Err) this.message.error('approve failed, Reason: ' + Object.keys(approve_res.Err)[0]);
                                console.log('approve failed', approve_res.Err);

                                return;
                            }
                        } catch(e) {
                            this.message.error('approve failed');
                            console.log('approve failed', e);
                        }
                    } else {
                        this.message.error(`standard ${token.token_type} not supported`);
                        return;
                    }
                } 

                let merchant_actor = createMerchantActor(this.merchant_principal, {
                    agent
                });

                let pay_res = await merchant_actor.pay_order(this.order_id) as {
                    Ok: boolean | undefined,
                    Err: string | undefined
                };

                if(pay_res.Ok === undefined) {
                    this.message.error('error paying, Reason: ' + pay_res.Err);
                    return;
                }

                this.message.success('paid successfully');
            }

            this.disablePay = true;
            await approveNPay();
            this.disablePay = false;
        },
        async refund_order() {
            const refund = async () => {
                let p: Principal;
                try {
                    p = Principal.fromText(this.merchant_principal);
                } catch(e) {
                    this.message.error("can't parse merchant principal");
                    return;
                }

                let identity = await this.getIdentity();
                if(identity === null) {
                    this.message.error("fail to get identity");
                    return;
                }
                let agent = new HttpAgent({
                    identity
                });
                const merchant_actor = createMerchantActor(p, {
                    agent,
                });

                let refund_res = await merchant_actor.refund_order(this.order_id) as {
                    Ok: boolean | undefined,
                    Err: string | undefined
                };

                if(refund_res.Ok === undefined || refund_res.Ok === false) {
                    this.message.error('refunded error, Reason: ' + refund_res.Err);
                } else {
                    this.message.success('refunded');
                }
            }  
            this.refund_disabled = true;
            await refund();
            this.refund_disabled = false;
        },
        async make_comment(comment: string) {
            const commentFunc = async () => {
                let p: Principal;
                try {
                    p = Principal.fromText(this.merchant_principal);
                } catch(e) {
                    this.message.error("can't parse merchant principal");
                    return;
                }

                let identity = await this.getIdentity();
                if(identity === null) {
                    this.message.error("fail to get identity");
                    return;
                }
                let agent = new HttpAgent({
                    identity
                });
                const merchant_actor = createMerchantActor(p, {
                    agent,
                });

                let enc = new TextEncoder();
                let payload = enc.encode(comment);
                let comment_res = await merchant_actor.comment_order(this.order_id, payload, "string") as {
                    Ok: boolean | undefined,
                    Err: string | undefined
                };

                if(comment_res.Ok === undefined || !comment_res.Ok) {
                    this.message.error('error commenting, Reason: ' + comment_res.Err);
                    return;
                }

                this.message.success('comment successfully');
            }

            this.comment_disabled = true;
            await commentFunc();
            this.comment_disabled = false;
        },
        encode(spec: string, payload: number[]) {
            if(spec === 'string') {
                let dec = new TextDecoder();
                return dec.decode(new Uint8Array(payload));
            } else return payload;
        }
    },
    data() {
        let res : {
            tokens_needed: TokenLiteral[],
            status: string,
            paid: boolean,
            timestamp: bigint,
            payer: Account,
            comments: CommentLiteral[],
            payload: number[],
            payload_spec: string,
            user_comment: string,
            merchant_comment: string,
            merchant_principal: string,
            disablePay: boolean,
            is_payer: boolean,
            is_merchant: boolean,
            comment_disabled: boolean,
            refund_disabled: boolean
        } = {
            tokens_needed: [],
            status: "unknown",
            paid: false,
            timestamp: BigInt(0),
            payer: {owner: Principal.anonymous(), subaccount: []},
            payload: [],
            payload_spec: "unknown",
            comments: [],
            user_comment: "",
            merchant_comment: "",
            merchant_principal: "",
            disablePay: false,
            is_payer: false,
            is_merchant: false,
            comment_disabled: false,
            refund_disabled: false,
        }

        return res
    },
    async beforeMount() {
        console.log(this.$props);
        let merchant_principal = await manager_actor.get_merchant_by_id(this.$props.merchant_id);
        this.merchant_principal = merchant_principal.toString();

        if(merchant_principal[0]) {
            let merchant_actor = createManagerActor(merchant_principal[0]);
            let order = await merchant_actor.view_order(this.$props.order_id) as {Ok: Order | undefined, Err: string | undefined};

            let owner = await merchant_actor.owner();
            let user = (await this.getIdentity())?.getPrincipal();
            if(user !== undefined && user.toString() === owner.toString()) this.is_merchant = true;

            if(order.Ok) {
                let o = order.Ok;
                // tokens needed
                for(let item of o.tokens_needed) {
                    let token: TokenLiteral = {
                        principal: item[0].principal.toString(),
                        token_type: Object.keys(item[0].token_type)[0],
                        amount: item[1]
                    }

                    this.tokens_needed.push(token)
                }
                this.status = Object.keys(o.status)[0];
                this.paid = o.paid;
                this.timestamp = o.timestamp;
                this.payer = o.payer;

                if(user !== undefined && user.toString() === o.payer.owner.toString()) this.is_payer = true;
                // comments
                for(let item of o.comments) {
                    let comment: CommentLiteral = {
                        issuer: item.issuer.toString(),
                        timestamp: String(item.timestamp),
                        payload: item.payload as number[],
                        payload_spec: item.payload_spec
                    }  
                    this.comments.push(comment);
                }
                this.payload = o.payload as number[];
                if(o.payload_spec[0]) this.payload_spec = o.payload_spec[0]
            } else {
                console.log(`Error querying order ${this.$props.merchant_id}, ${this.$props.order_id}`)
            }
        }
    }
})
</script>

<template>
    <n-card title="Order Info">
        <div class="flex flex-row text-lg">
            <div class="w-64">MerchantID</div>
            <div>{{ props.merchant_id }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Order ID</div>
            <div>{{ props.order_id }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Paid</div>
            <div>{{ paid?"paid":"unpaid" }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Status</div>
            <div>{{ status }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Timestamp</div>
            <div>{{ timestamp }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Payer</div>
            <div>{{ payer.owner }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Payload</div>
            <div>{{ payload }}</div>
        </div>
        <div class="flex flex-row text-lg">
            <div class="w-64">Payload Spec</div>
            <div>{{ payload_spec }}</div>
        </div>
        
        <div class="flex flex-row text-lg">
            <div class="w-64">Tokens:</div>
            <div v-for="token in tokens_needed">
                <div class="token-list-header flex flex-row text-blue-400">
                    <div class="w-80">Principal</div>
                    <div class="w-80">Token Type</div>
                    <div>Amount</div>
                </div>
                <div class="token-list-body flex flex-row">
                    <div class="w-80">{{ token.principal.toString() }}</div>
                    <div class="w-80">{{ token.token_type }}</div>
                    <div>{{ token.amount }}</div>
                </div>
            </div>
        </div>
    </n-card>

    <n-card title="Comments">
        <n-list hoverable>
            <div v-for="comment in comments">
                <n-list-item>
                    <div class="flex flex-col">
                        <div class="flex flex-row space-x-9 text-lg text-blue-400">
                            <div>{{ comment.issuer }}</div>
                            <div>{{ comment.timestamp }}</div>
                            <div>{{ comment.payload_spec }}</div>
                        </div>
                        <div>{{ encode(comment.payload_spec, comment.payload) }}</div>
                    </div>
                </n-list-item>
            </div>
        </n-list> 
    </n-card>

    <n-card title="Payer Operations" v-if="is_payer">
        <n-button
            @click="approve_and_pay"
            :disabled="disablePay"
        >Approve Token and Pay</n-button>
        <div class="mt-3">
            <n-input
                type="textarea"
                placeholder="dispute here"
                v-model:value="user_comment"
            ></n-input>
            <n-button
                @click="make_comment(user_comment)"
                :disabled="comment_disabled"
            >Dispute Order</n-button>
        </div>
    </n-card>

    <n-card title="Merchant Operations" v-if="is_merchant">
        <n-button 
            @click="refund_order"
            :disabled="refund_disabled"
        >Refund Order</n-button>
        <div class="mt-3">
            <n-input
                type="textarea"
                placeholder="explain here"
                v-model:value="merchant_comment"
            ></n-input>
            <n-button 
                @click="make_comment(merchant_comment)"
                :disabled="comment_disabled"
            >Make Comment</n-button>
        </div>
    </n-card>
</template>