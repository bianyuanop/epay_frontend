# ePay demo frontend 

This frontend is can be now only used locally since there is a compiling issue I met when I want to build and upload this to IC main net. A demonstration video is recorded and you can find the video [here](https://www.youtube.com/watch?v=qlpDlo1tyD0)

## Developer guides

To let this frontend running locally, you need to type

```
dfx cansiter create ePay_frontend
```

and then to host an internet identity canister locally, instructions can be found [here](https://forum.dfinity.org/t/how-to-run-internet-identity-locally-without-docker/17777)

After hosting an internet identity canister, substitute the canister id at [here](https://github.com/bianyuanop/epay_frontend/blob/main/vite.config.ts#L37) to the id you just obtained.

Then at the `src/info.ts` file, change the `MANAGER` and `USER` canister principals you deployed in the backend. 

To install dependencies

```
npm install
```

To host

```
npm run dev
```

### Vite config

you may need to change the proxy section at `vite.config.ts` [here](https://github.com/bianyuanop/epay_frontend/blob/main/vite.config.ts#L101)

