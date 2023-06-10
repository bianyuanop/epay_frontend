export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const OrderBrief = IDL.Record({
    'merchant_id' : IDL.Nat64,
    'order_id' : IDL.Nat64,
  });
  const User = IDL.Record({
    'id' : IDL.Nat,
    'principal' : IDL.Principal,
    'username' : IDL.Opt(IDL.Text),
    'blocked' : IDL.Bool,
    'orders' : IDL.Vec(OrderBrief),
    'merchants' : IDL.Vec(IDL.Nat64),
  });
  return IDL.Service({
    'add_order' : IDL.Func([IDL.Principal, IDL.Nat64, IDL.Nat64], [Result], []),
    'get_user' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'register' : IDL.Func([IDL.Principal], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
