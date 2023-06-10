export const idlFactory = ({ IDL }) => {
  const TokenType = IDL.Variant({
    'ICRC1' : IDL.Null,
    'DIP20' : IDL.Null,
    'OTHER' : IDL.Null,
  });
  const TokenInfo = IDL.Record({
    'principal' : IDL.Principal,
    'token_type' : TokenType,
  });
  const MerchantConfig = IDL.Record({
    'token_allowed' : IDL.Vec(TokenInfo),
    'fee_to' : IDL.Principal,
    'fee_rate' : IDL.Float32,
    'order_check_duration' : IDL.Nat64,
    'order_on_hold_duration' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const OrderStatus = IDL.Variant({
    'Refunded' : IDL.Null,
    'Open' : IDL.Null,
    'Closed' : IDL.Null,
    'Controversial' : IDL.Null,
    'Unpaid' : IDL.Null,
  });
  const Comment = IDL.Record({
    'payload_spec' : IDL.Text,
    'issuer' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'payload' : IDL.Vec(IDL.Nat8),
  });
  const Order = IDL.Record({
    'id' : IDL.Nat64,
    'tokens_needed' : IDL.Vec(IDL.Tuple(TokenInfo, IDL.Nat)),
    'payload_spec' : IDL.Opt(IDL.Text),
    'status' : OrderStatus,
    'paid' : IDL.Bool,
    'receiving_account' : Account,
    'timestamp' : IDL.Nat64,
    'payer' : Account,
    'comments' : IDL.Vec(Comment),
    'payload' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_2 = IDL.Variant({ 'Ok' : Order, 'Err' : IDL.Text });
  return IDL.Service({
    'comment_order' : IDL.Func(
        [IDL.Nat64, IDL.Vec(IDL.Nat8), IDL.Text],
        [Result],
        [],
      ),
    'get_config' : IDL.Func([], [MerchantConfig], []),
    'order_paid' : IDL.Func([IDL.Nat64], [Result], ['query']),
    'owner' : IDL.Func([], [IDL.Principal], ['query']),
    'pay_order' : IDL.Func([IDL.Nat64], [Result], []),
    'publish_order' : IDL.Func(
        [
          IDL.Vec(IDL.Principal),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Nat),
          IDL.Opt(IDL.Vec(IDL.Nat8)),
          IDL.Opt(IDL.Text),
          Account,
        ],
        [Result_1],
        [],
      ),
    'refund_order' : IDL.Func([IDL.Nat64], [Result], []),
    'set_block' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'set_verify' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'update_config' : IDL.Func([MerchantConfig], [], []),
    'update_info' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
    'view_order' : IDL.Func([IDL.Nat64], [Result_2], ['query']),
  });
};
export const init = ({ IDL }) => {
  const TokenType = IDL.Variant({
    'ICRC1' : IDL.Null,
    'DIP20' : IDL.Null,
    'OTHER' : IDL.Null,
  });
  const TokenInfo = IDL.Record({
    'principal' : IDL.Principal,
    'token_type' : TokenType,
  });
  const MerchantConfig = IDL.Record({
    'token_allowed' : IDL.Vec(TokenInfo),
    'fee_to' : IDL.Principal,
    'fee_rate' : IDL.Float32,
    'order_check_duration' : IDL.Nat64,
    'order_on_hold_duration' : IDL.Nat64,
  });
  return [IDL.Principal, MerchantConfig];
};
