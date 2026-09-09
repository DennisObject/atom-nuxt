import nodeFetch from "node-fetch";
import {
  defineEventHandler,
  getRequestURL,
  getRequestHeader,
  proxyRequest,
} from "h3";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  const read = ["GET", "HEAD"].includes(event.method);
  const backendPath =
    /^\/(api|sanctum|storage|housekeeping|livewire(?:-[a-z0-9]+)?|build-housekeeping|assets|client|css|js|fonts|images|vendor)(\/|$)/.test(
      path
    );
  const authPath =
    /^\/(login|register|logout|two-factor-challenge|forgot-password|reset-password|user\/confirm-password|user\/settings\/two-factor-authentication)(\/|$)/.test(
      path
    );
  const userAuthPath =
    /^\/user\/(confirm-password|confirmed-password-status|two-factor-[^/]+|confirmed-two-factor-authentication|settings\/two-factor-authentication)(\/|$)/.test(
      path
    );
  const paymentCallback =
    /^\/paypal\/(successful-transaction|cancelled-transaction|process-transaction)$/.test(
      path
    );
  if (!backendPath && !userAuthPath && !paymentCallback && !(authPath && !read))
    return;
  const config = useRuntimeConfig(event);
  const backend = config.backendUrl.replace(/\/$/, "");
  return proxyRequest(event, `${backend}${path}${url.search}`, {
    // Node fetch preserves the public Host header when Laravel is reached on an internal origin.
    fetch: nodeFetch as unknown as typeof globalThis.fetch,
    fetchOptions: { redirect: "manual" },
    headers: {
      host: url.host,
      accept: getRequestHeader(event, "accept") || "*/*",
    },
  });
});
