import { tokenManager } from "../utils/tokenManager.js";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

function formatPhone(input) {
  let phone = input.replace(/\D/g, "");
  if (phone.startsWith("62")) {
    phone = phone.slice(2);
  } else if (phone.startsWith("0")) {
    phone = phone.slice(1);
  }
  return phone;
}

function isValidPhone(input) {
  let phone = input.replace(/\D/g, "");
  if (phone.startsWith("62")) {
    phone = phone.slice(2);
  } else if (phone.startsWith("0")) {
    phone = phone.slice(1);
  } else if (!phone.startsWith("8")) {
    return false;
  }
  return phone.startsWith("8") && phone.length >= 10 && phone.length <= 13;
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function makeAuthenticatedRequest(url, options = {}) {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...tokenManager.getAuthHeader(),
      ...(options.headers || {}),
    },
  };

  return fetch(url, {
    ...defaultOptions,
    ...options,
    headers: defaultOptions.headers,
  });
}

export async function fetchStatsByRole(user) {
  if (!user) throw new Error("No user");
  if (user.role === "admin") {
    const res = await makeAuthenticatedRequest(
      `${apiUrl}/api/admin/pending-documents`
    );
    const data = await res.json();
    return {
      unverified: Array.isArray(data.documents) ? data.documents.length : 0,
    };
  } else if (user.role === "rt_admin") {
    const res = await makeAuthenticatedRequest(
      `${apiUrl}/api/rt-admin/requests`
    );
    const requests = await res.json();
    return { unapproved: requests.length };
  } else if (user.role === "kelurahan_admin") {
    const res = await makeAuthenticatedRequest(
      `${apiUrl}/api/kelurahan-admin/requests`
    );
    const requests = await res.json();
    return { unapproved: requests.length };
  } else {
    const [
      pendingDocs,
      rejectedDocs,
      verifiedDocs,
      pendingReqs,
      rejectedReqs,
      approvedReqs,
    ] = await Promise.all([
      makeAuthenticatedRequest(`${apiUrl}/api/documents?status=pending`).then(
        (r) => r.json()
      ),
      makeAuthenticatedRequest(`${apiUrl}/api/documents?status=rejected`).then(
        (r) => r.json()
      ),
      makeAuthenticatedRequest(`${apiUrl}/api/documents?status=verified`).then(
        (r) => r.json()
      ),
      makeAuthenticatedRequest(`${apiUrl}/api/requests?status=pending`).then(
        (r) => r.json()
      ),
      makeAuthenticatedRequest(`${apiUrl}/api/requests?status=rejected`).then(
        (r) => r.json()
      ),
      makeAuthenticatedRequest(`${apiUrl}/api/requests?status=approved`).then(
        (r) => r.json()
      ),
    ]);
    return {
      pendingDocs: pendingDocs.length,
      rejectedDocs: rejectedDocs.length,
      verifiedDocs: verifiedDocs.length,
      pendingReqs: pendingReqs.length,
      rejectedReqs: rejectedReqs.length,
      approvedReqs: approvedReqs.length,
    };
  }
}

export async function fetchRecentDocsAndReqs(user) {
  if (!user || user.role !== "user") return { docs: [], reqs: [] };
  const [docs, reqs] = await Promise.all([
    makeAuthenticatedRequest(`${apiUrl}/api/documents`).then((r) => r.json()),
    makeAuthenticatedRequest(`${apiUrl}/api/requests`).then((r) => r.json()),
  ]);
  return { docs, reqs };
}

export async function fetchLocationName(user) {
  if (!user) return "";
  if (user.role === "rt_admin" && user.rt_id) {
    const res = await fetch(`${apiUrl}/api/locations?type=rt`, {
      credentials: "include",
    });
    const data = await res.json();
    const found = Array.isArray(data)
      ? data.find((rt) => rt.rt_id === user.rt_id)
      : null;
    return found ? found.name || "" : "";
  } else if (user.role === "kelurahan_admin" && user.kelurahan_id) {
    const res = await fetch(`${apiUrl}/api/locations?type=kelurahan`, {
      credentials: "include",
    });
    const data = await res.json();
    const found = Array.isArray(data)
      ? data.find((kel) => kel.kelurahan_desa_id === user.kelurahan_id)
      : null;
    return found ? found.name || "" : "";
  }
  return "";
}

export async function fetchDocumentsByStatus(status) {
  const res = await makeAuthenticatedRequest(
    `${apiUrl}/api/documents?status=${status}`,
    {
      method: "GET",
    }
  );
  if (res.status === 401) {
    tokenManager.clearAll();
    window.location.href = "/login";
    return [];
  }
  return await res.json();
}

export async function fetchRequestsByStatus(status, user) {
  let url = `${apiUrl}/api/requests?status=${status}`;
  if (user && user.role === "rt_admin") {
    url = `${apiUrl}/api/rt-admin/requests?status=${status}`;
  } else if (user && user.role === "kelurahan_admin") {
    url = `${apiUrl}/api/kelurahan-admin/requests?status=${status}`;
  }
  const res = await makeAuthenticatedRequest(url, {
    method: "GET",
  });
  if (res.status === 401) {
    tokenManager.clearAll();
    window.location.href = "/login";
    return [];
  }
  return await res.json();
}

export async function shareRequest(requestId, password) {
  const response = await fetch(`${apiUrl}/api/shares/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ requestId, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create share");
  }
  const data = await response.json();
  return data.token;
}

export async function shareDocuments(documentIds, password) {
  const response = await fetch(`${apiUrl}/api/shares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ documentIds, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create share");
  }
  const data = await response.json();
  return data.token;
}

export async function deleteDocument(documentId) {
  const res = await fetch(`${apiUrl}/api/documents/delete/${documentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return res;
}

export async function updateDocument(documentId, file, fileType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentId", documentId);
  formData.append("file_type", fileType || "");
  const response = await fetch(`${apiUrl}/api/documents/update`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return response;
}

export async function verifyPassword(password) {
  const response = await makeAuthenticatedRequest(
    `${apiUrl}/api/auth/verify-password`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Password verification failed");
  }
  return true;
}

export async function deleteMultipleDocuments(documentIds) {
  return Promise.all(
    documentIds.map((id) =>
      fetch(`${apiUrl}/api/documents/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
    )
  );
}

export async function deleteMultipleRequests(requestIds) {
  return Promise.all(
    requestIds.map((id) =>
      fetch(`${apiUrl}/api/requests/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
    )
  );
}

export async function getRequest(purpose, requestId) {
  let url;
  if (purpose === "request") {
    url = `${apiUrl}/api/shares/request/${requestId}`;
  } else if (purpose === "documents") {
    url = `${apiUrl}/api/shares/${requestId}`;
  }

  const response = await fetch(url, {
    credentials: "include",
  });

  return response;
}

export async function fetchUserFullName(userId) {
  if (!userId) return "-";

  try {
    const res = await fetch(`${apiUrl}/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 401) {
      const resNoAuth = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (resNoAuth.ok) {
        const data = await resNoAuth.json();
        return data.full_name || "-";
      }
      return "-";
    }
    if (res.ok) {
      const data = await res.json();
      return data.full_name || "-";
    } else {
      return "-";
    }
  } catch {
    return "-";
  }
}

export async function fetchRTName(rtId) {
  if (!rtId) return null;

  try {
    const res = await fetch(`${apiUrl}/api/locations?type=rt`, {
      credentials: "include",
    });

    if (res.status === 401) {
      const resNoAuth = await fetch(`${apiUrl}/api/locations?type=rt`);
      if (!resNoAuth.ok) return null;
      const data = await resNoAuth.json();
      if (Array.isArray(data) && data.length > 0) {
        const matched = data.find((rt) => rt.rt_id === rtId);
        return matched ? matched.name : null;
      }
      return null;
    }

    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const matched = data.find((rt) => rt.rt_id === rtId);
      return matched ? matched.name : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchKelurahanName(kelurahanId, rtId) {
  let targetKelurahanId = kelurahanId;
  if (!targetKelurahanId && rtId) {
    targetKelurahanId = rtId.slice(0, 12);
  }

  if (!targetKelurahanId) return null;

  try {
    const res = await fetch(`${apiUrl}/api/locations?type=kelurahan`, {
      credentials: "include",
    });

    if (res.status === 401) {
      const resNoAuth = await fetch(`${apiUrl}/api/locations?type=kelurahan`);
      if (!resNoAuth.ok) return null;
      const data = await resNoAuth.json();
      if (Array.isArray(data) && data.length > 0) {
        const matched = data.find(
          (kel) => kel.kelurahan_desa_id === targetKelurahanId
        );
        return matched ? matched.name : null;
      }
      return null;
    }

    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const matched = data.find(
        (kel) => kel.kelurahan_desa_id === targetKelurahanId
      );
      return matched ? matched.name : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function activateAndFetchShare(token, type = "request") {
  const endpoint = type === "request" ? "request" : "";
  const activateUrl = `${apiUrl}/api/shares/${endpoint}${
    endpoint ? "/" : ""
  }${token}/activate`;
  const fetchUrl = `${apiUrl}/api/shares/${endpoint}${
    endpoint ? "/" : ""
  }${token}`;

  try {
    const activateResponse = await fetch(activateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!activateResponse.ok) {
      const activateError = await activateResponse.json();
      if (activateResponse.status === 410) {
        return { error: activateError.message || "Share has expired" };
      } else if (activateResponse.status === 404) {
        return { error: "Share not found" };
      } else {
        return { error: activateError.message || "Failed to activate share" };
      }
    }
  } catch (error) {
    return { error: `Network error during activation: ${error.message}` };
  }

  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const fetchError = await response.json();
      if (response.status === 404) {
        return { error: "Share not found" };
      } else if (response.status === 410) {
        return { error: fetchError.message || "Share has expired" };
      } else {
        const errorMessage =
          type === "request"
            ? "Failed to fetch shared request"
            : "Failed to fetch share";
        return {
          error: `${errorMessage}: ${
            fetchError.message || response.statusText
          }`,
        };
      }
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: `Network error during fetch: ${error.message}` };
  }
}

export async function loginUser(phone, password) {
  if (!isValidPhone(phone)) {
    throw new Error(
      "Phone number must start with 62, 0, or 8 and contain 10-13 digits after 8"
    );
  }

  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone: formatPhone(phone), password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed: Unknown error");
  }

  if (data.accessToken) {
    tokenManager.setAccessToken(data.accessToken);
  }
  if (data.refreshToken) {
    tokenManager.setRefreshToken(data.refreshToken);
  }
  if (data.user) {
    tokenManager.setUserData(data.user);
  }

  return data;
}

export async function logoutUser() {
  const refreshToken = tokenManager.getRefreshToken();

  const response = await fetch(`${apiUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...tokenManager.getAuthHeader(),
    },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });

  tokenManager.clearAll();

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return true;
}

export async function updateUserPhone(phone, password) {
  const response = await fetch(`${apiUrl}/api/users/update-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update phone number.");
  }

  return data;
}

export async function registerUser(fullName, phone, password) {
  if (!isValidPhone(phone)) {
    throw new Error(
      "Phone number must start with 62, 0, or 8 and contain 10-13 digits after 8"
    );
  }

  const strongPasswordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
  if (!strongPasswordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include at least one special character"
    );
  }
  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: capitalizeWords(fullName.trim()),
      phone: formatPhone(phone),
      password,
      role: "user",
      rtId: null,
      kelurahanId: null,
    }),
  });
  const res = await response.json();

  if (!response.ok) {
    throw new Error(res.message || "Failed to register");
  }

  return res;
}

export async function uploadDocument(file, fileType) {
  if (!file) {
    throw new Error("Please select a file to upload.");
  }

  const formData = new FormData();
  formData.append("file_type", fileType);
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/api/documents`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let msg = "Upload failed";
    try {
      const data = await response.json();
      if (data && data.message) msg = data.message;
    } catch {
      msg = "Upload failed";
    }
    throw new Error(msg);
  }

  return response;
}

export async function fetchLocationsByType(type, parentId = null) {
  let url = `${apiUrl}/api/locations?type=${type}`;

  if (parentId) {
    switch (type) {
      case "kabupaten_kota":
        url += `&provinsi_id=${parentId}`;
        break;
      case "kecamatan":
        url += `&kabupaten_kota_id=${parentId}`;
        break;
      case "kelurahan":
        url += `&kecamatan_id=${parentId}`;
        break;
      case "rt":
        url += `&kelurahan_desa_id=${parentId}`;
        break;
    }
  }

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type}`);
  }

  return response.json();
}

export async function submitRequest(
  tujuanSurat,
  requestType,
  rtId = null,
  kelurahanId = null
) {
  const body = {
    tujuan_surat: tujuanSurat,
    request_type: requestType,
    rt_id: requestType === "RT" ? rtId : null,
    kelurahan_id: requestType === "Kelurahan" ? kelurahanId : null,
  };

  const response = await fetch(`${apiUrl}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Request submission failed");
  }

  return response;
}

export async function fetchCurrentUser() {
  const isAuth = tokenManager.isAuthenticated();

  if (!isAuth) {
    return null;
  }

  const storedUser = tokenManager.getUserData();

  if (storedUser) {
    return storedUser;
  }

  const response = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...tokenManager.getAuthHeader(),
    },
    credentials: "include",
  });

  if (response.status === 401) {
    tokenManager.clearAll();
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  const data = await response.json();

  if (data.user) {
    tokenManager.setUserData(data.user);
    return data.user;
  }

  return null;
}

export async function deleteRequest(requestId) {
  const response = await makeAuthenticatedRequest(
    `${apiUrl}/api/requests/${requestId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete request");
  }

  return response;
}

export async function fetchPendingDocuments() {
  const response = await fetch(`${apiUrl}/api/admin/pending-documents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pending documents");
  }

  const data = await response.json();
  return data.documents;
}

export async function verifyDocument(documentId) {
  const response = await fetch(`${apiUrl}/api/admin/verify/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to verify document");
  }

  return response;
}

export async function rejectDocument(documentId) {
  const response = await fetch(`${apiUrl}/api/admin/reject/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to reject document");
  }

  return response;
}

export async function fetchRecentActivity(userRole) {
  let url = "";
  if (userRole === "admin") url = `${apiUrl}/api/admin/recent-activity`;
  else if (userRole === "rt_admin")
    url = `${apiUrl}/api/rt-admin/recent-activity`;
  else if (userRole === "kelurahan_admin")
    url = `${apiUrl}/api/kelurahan-admin/recent-activity`;

  if (!url) throw new Error("Invalid user role");

  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to load activity");
  }

  const data = await response.json();
  return data.activity || [];
}
