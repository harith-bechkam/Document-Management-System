import { LogLevel } from "@azure/msal-browser";


export let msalConfig = {
    auth: {
        clientId: '7649ab71-5539-46a0-918a-f1d62f34c534', // This is the ONLY mandatory field that you need to supply.
        authority: 'https://login.microsoftonline.com/4bb1361f-d0b8-467e-a4a8-78e191d5e5cb', // Defaults to "https://login.microsoftonline.com/common"
        redirectUri: 'http://localhost:3000/home', // Points to window.location.origin. You must register this URI on Azure Portal/App Registration.
        // postLogoutRedirectUri: '/auth', // Indicates the page to navigate after logout.
        // navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
}

export let loginRequest = {
    scopes: ['user.read']
    // prompt: "create"//select_account
}