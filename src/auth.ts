  // Your application's name (URI encoded)
  const APPLICATION_NAME = encodeURI("ePay") ;

  // URL to 37x37px logo of your application (URI encoded)
  const APPLICATION_LOGO_URL = "https://nfid.one/icons/favicon-96x96.png";

  const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";

  // Replace https://identity.ic0.app with NFID_AUTH_URL
  // as the identityProvider for authClient.login({}) 
  export const NFID_AUTH_URL = "https://nfid.one" + AUTH_PATH;