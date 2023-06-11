import {createActor as createManagerActor} from './declarations/manager';
import {createActor as createUserActor} from './declarations/user';

export const manager_principal = "bd3sg-teaaa-aaaaa-qaaba-cai";
export const user_principal = "ajuq4-ruaaa-aaaaa-qaaga-cai";

export const manager_actor = createManagerActor(manager_principal);
export const user_actor = createUserActor(user_principal);