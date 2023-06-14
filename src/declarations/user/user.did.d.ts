import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface OrderBrief { 'merchant_id' : bigint, 'order_id' : bigint }
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export interface User {
  'id' : bigint,
  'principal' : Principal,
  'username' : [] | [string],
  'blocked' : boolean,
  'orders' : Array<OrderBrief>,
  'merchants' : BigUint64Array | bigint[],
}
export interface _SERVICE {
  'add_order' : ActorMethod<[Principal, bigint, bigint], undefined>,
  'attach_merchant2user' : ActorMethod<[Principal, bigint], Result>,
  'get_user' : ActorMethod<[Principal], [] | [User]>,
  'has_user' : ActorMethod<[Principal], boolean>,
  'register' : ActorMethod<[Principal], Result>,
}
