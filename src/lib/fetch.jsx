export function request(url, options) {
    return fetch(url, options);
  }
  
  export function get(url, headers = {}) {
    return fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  }
  
  
  export function post(url, body, headers = {}) {
    return fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }
  
  export function put(url, body, headers = {}) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        ...headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }
  
  export function del(url, body = null, headers = {}) {
    return fetch(url, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });
  }
  