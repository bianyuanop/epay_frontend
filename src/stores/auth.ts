import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { defineStore } from "pinia";
import { toRaw } from 'vue';


// Your application's name (URI encoded)
const APPLICATION_NAME = encodeURI("ePay") ;

// URL to 37x37px logo of your application (URI encoded)
const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";

const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";

// Replace https://identity.ic0.app with NFID_AUTH_URL
// as the identityProvider for authClient.login({}) 
const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;

const defaultAuthOptions = {
  /**
   *  @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      disableIdle: true,
    },
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === "ic"
        ? NFID_AUTH_URL
        : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
  },
};

console.log(defaultAuthOptions);

export const userAuthStore = defineStore('auth', {
    state: () => {
        let res: {
            isReady: boolean,
            isAuthenticated: boolean,
            authClient: AuthClient | null,
            identity: Identity | null,
        } = {
            isReady: false,
            isAuthenticated: false,
            authClient: null,
            identity: null
        };

        return res;
    },
    actions: {
        async init() {
            const refresh = () => {
                this.isAuthenticated = false;
                this.identity = null;
            }

            const authClient = await AuthClient.create();
            authClient.idleManager?.registerCallback(refresh);

            this.authClient = authClient;
            this.isAuthenticated = await authClient.isAuthenticated();
            this.identity = this.isAuthenticated ? authClient.getIdentity() : null;

            this.isReady = true;
        },
        async login() {
            const authClient = toRaw(this.authClient);
            authClient?.login({
                // ...defaultAuthOptions.loginOptions,
                onSuccess: async () => {
                    this.isAuthenticated = await authClient.isAuthenticated();
                    this.identity = this.isAuthenticated ? authClient.getIdentity() : null;
                },
                identityProvider: process.env.DFX_NETWORK === "ic" 
                    ? NFID_AUTH_URL 
                    : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
            })
        },
        async logout() {
            const authClient = toRaw(this.authClient);
            await authClient?.logout();
            this.isAuthenticated = false;
            this.identity = null;
        },
        getPrincipal() {
            const identity = toRaw(this.identity);
            return identity?.getPrincipal();
        },
        getIdentity() {
            return toRaw(this.identity);
        },
        async isRealAuthenticated() {
            const authClient = toRaw(this.authClient);
            return await authClient?.isAuthenticated();
        }
    }
})