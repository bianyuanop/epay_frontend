import { Principal } from '@dfinity/principal';
import { defineStore } from 'pinia';

export const useGeneralStore = defineStore('general', {
    state: () => ({
        principal: Principal.anonymous().toString(),
        authClient: "",
    }),
    actions: {
        set_principal(p: Principal) {
            this.principal = p.toString();
        },
        set_authClient(authClient: string) {
            this.authClient = authClient;
        }
    }
})