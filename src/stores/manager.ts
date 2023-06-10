import { Principal } from '@dfinity/principal';
import { defineStore } from 'pinia';

export const useManagerStore = defineStore('manager', {
    state: () => {
        return {
            principal: Principal.anonymous(),
        } 
    },

    actions: {
        set_principal(p: Principal) {
            this.principal = p;
        }
    }

})