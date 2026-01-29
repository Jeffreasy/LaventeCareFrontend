import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

if (!convexUrl) {
    console.error("PUBLIC_CONVEX_URL is not defined in .env");
}

export const convex = new ConvexReactClient(convexUrl || "");
