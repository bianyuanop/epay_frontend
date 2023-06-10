import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface OrderBrief { 'merchant_id' : bigint, 'order_id' : bigint }
export type Result = { 'Ok' : boolean } |
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
  'add_order' : ActorMethod<[Principal, bigint, bigint], Result>,
  'get_user' : ActorMethod<[Principal], [] | [User]>,
  'register' : ActorMethod<[Principal], undefined>,
}
