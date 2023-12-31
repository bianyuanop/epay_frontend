import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Balance { 'token_balances' : Array<[Principal, TokenBalance]> }
export interface Comment {
  'payload_spec' : string,
  'issuer' : Principal,
  'timestamp' : bigint,
  'payload' : Uint8Array | number[],
}
export interface Merchant {
  'id' : bigint,
  'fee' : Balance,
  'info_spec' : [] | [string],
  'verified' : boolean,
  'balance' : Balance,
  'owner' : Principal,
  'deposit_account' : Account,
  'conf' : MerchantConfig,
  'blocked' : boolean,
  'info' : [] | [Uint8Array | number[]],
  'orders' : Array<[bigint, Order]>,
  'order_ptr' : bigint,
  'orders_on_hold' : BigUint64Array | bigint[],
  'comments' : Array<Comment>,
}
export interface MerchantConfig {
  'token_allowed' : Array<TokenInfo>,
  'fee_to' : Principal,
  'fee_rate' : number,
  'order_check_duration' : bigint,
  'order_on_hold_duration' : bigint,
}
export interface Order {
  'id' : bigint,
  'tokens_needed' : Array<[TokenInfo, bigint]>,
  'payload_spec' : [] | [string],
  'status' : OrderStatus,
  'paid' : boolean,
  'receiving_account' : Account,
  'timestamp' : bigint,
  'payer' : Account,
  'comments' : Array<Comment>,
  'payload' : [] | [Uint8Array | number[]],
}
export type OrderStatus = { 'Refunded' : null } |
  { 'Open' : null } |
  { 'Closed' : null } |
  { 'Controversial' : null } |
  { 'Unpaid' : null };
export type Result = { 'Ok' : boolean } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : Order } |
  { 'Err' : string };
export interface TokenBalance { 'balance' : bigint, 'token_info' : TokenInfo }
export interface TokenInfo { 'principal' : Principal, 'token_type' : TokenType }
export type TokenType = { 'ICRC1' : null } |
  { 'DIP20' : null } |
  { 'OTHER' : null };
export interface _SERVICE {
  'comment_order' : ActorMethod<
    [bigint, Uint8Array | number[], string],
    Result
  >,
  'get_config' : ActorMethod<[], MerchantConfig>,
  'get_merchant_info' : ActorMethod<[], Merchant>,
  'get_on_hold_orders' : ActorMethod<[], BigUint64Array | bigint[]>,
  'order_paid' : ActorMethod<[bigint], Result>,
  'owner' : ActorMethod<[], Principal>,
  'pay_order' : ActorMethod<[bigint], Result>,
  'publish_order' : ActorMethod<
    [
      Array<Principal>,
      Array<string>,
      Array<bigint>,
      [] | [Uint8Array | number[]],
      [] | [string],
      Account,
    ],
    Result_1
  >,
  'refund_order' : ActorMethod<[bigint], Result>,
  'set_block' : ActorMethod<[boolean], boolean>,
  'set_verify' : ActorMethod<[boolean], boolean>,
  'update_config' : ActorMethod<[MerchantConfig], undefined>,
  'update_info' : ActorMethod<[string, Uint8Array | number[]], undefined>,
  'view_order' : ActorMethod<[bigint], Result_2>,
}
