import { Principal } from '@dfinity/principal';
import { defineStore } from 'pinia';

export const useGeneralStore = defineStore('general', {
    state: () => ({
        principal: Principal.anonymous(),
    }),
    actions: {
        set_principal(p: Principal) {
            this.principal = p;
        }
    }
})