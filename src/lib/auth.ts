import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "https://giant-opossum-714.convex.site/api/auth", 
    plugins: [
        expoClient({
            scheme: "localpulse", 
            storage: SecureStore,
        })
    ]
});
