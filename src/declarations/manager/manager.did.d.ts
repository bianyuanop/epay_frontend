import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface MerchantConfig {
  'token_allowed' : Array<TokenInfo>,
  'fee_to' : Principal,
  'fee_rate' : number,
  'order_check_duration' : bigint,
  'order_on_hold_duration' : bigint,
}
export interface MerchantManageReport {
  'report' : Array<[bigint, string]>,
  'timestamp' : bigint,
}
export type Result = { 'Ok' : boolean } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : MerchantConfig } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : Principal } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : null } |
  { 'Err' : string };
export interface TokenInfo { 'principal' : Principal, 'token_type' : TokenType }
export type TokenType = { 'ICRC1' : null } |
  { 'DIP20' : null } |
  { 'OTHER' : null };
export interface _SERVICE {
  'add_manager' : ActorMethod<[Principal], Result>,
  'create_merchant' : ActorMethod<[Principal], Result_1>,
  'get_merchant_by_id' : ActorMethod<[bigint], [] | [Principal]>,
  'get_merchant_conf' : ActorMethod<[bigint], Result_2>,
  'get_user_canister' : ActorMethod<[], [] | [Principal]>,
  'install_user_canister' : ActorMethod<[], Result_3>,
  'remove_manager' : ActorMethod<[Principal], Result>,
  'set_merchant_block' : ActorMethod<[bigint, boolean], Result>,
  'set_merchant_verified' : ActorMethod<[bigint, boolean], Result>,
  'update_all_merchant_allowed_tokens' : ActorMethod<[], MerchantManageReport>,
  'update_allowed_token_list' : ActorMethod<
    [Array<Principal>, Array<string>],
    Result_4
  >,
  'update_merchant_conf' : ActorMethod<[bigint, MerchantConfig], Result_4>,
  'upload_wasm' : ActorMethod<[string, Uint8Array | number[]], Result_4>,
}
