export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
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
  const Result_2 = IDL.Variant({ 'Ok' : MerchantConfig, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : IDL.Text });
  const MerchantManageReport = IDL.Record({
    'report' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Text)),
    'timestamp' : IDL.Nat64,
  });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'add_manager' : IDL.Func([IDL.Principal], [Result], []),
    'create_merchant' : IDL.Func([IDL.Principal], [Result_1], []),
    'get_merchant_by_id' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'get_merchant_conf' : IDL.Func([IDL.Nat64], [Result_2], []),
    'install_user_canister' : IDL.Func([], [Result_3], []),
    'remove_manager' : IDL.Func([IDL.Principal], [Result], []),
    'set_merchant_block' : IDL.Func([IDL.Nat64, IDL.Bool], [Result], []),
    'set_merchant_verified' : IDL.Func([IDL.Nat64, IDL.Bool], [Result], []),
    'update_all_merchant_allowed_tokens' : IDL.Func(
        [],
        [MerchantManageReport],
        [],
      ),
    'update_allowed_token_list' : IDL.Func(
        [IDL.Vec(IDL.Principal), IDL.Vec(IDL.Text)],
        [Result_4],
        [],
      ),
    'update_merchant_conf' : IDL.Func(
        [IDL.Nat64, MerchantConfig],
        [Result_4],
        [],
      ),
    'upload_wasm' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [Result_4], []),
  });
};
export const init = ({ IDL }) => { return []; };
