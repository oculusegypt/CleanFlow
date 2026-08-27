type AdminMutationInit = Omit<RequestInit, "method"> & {
  method: "PATCH" | "DELETE";
}

/**
 * Some shared-hosting Apache configurations do not forward PATCH/DELETE
 * consistently to PHP. Try the normal request first, then retry as POST with
 * the standard method-override header when the server rejects the method.
 */
export async function fetchAdminMutation(
  url: string,
  init: AdminMutationInit,
): Promise<Response> {
  const response = await fetch(url, init)
  if (![404, 405, 501].includes(response.status)) return response

  const headers = new Headers(init.headers)
  headers.set("X-HTTP-Method-Override", init.method)

  return fetch(url, {
    ...init,
    method: "POST",
    headers,
  })
}