import { Principal } from '@dfinity/principal';
import { defineStore } from 'pinia';

export const MerchantStore = defineStore('merchant', {
    state: () => {
        return {
            managing_canister: Principal.anonymous()
        }
    },
    actions: {
        
    }
})