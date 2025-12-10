export const API_ENDPOINTS = {
  auth: 'https://functions.poehali.dev/198585cb-4af8-4249-86e8-4221aef6799c',
  users: 'https://functions.poehali.dev/7735e9fc-7e47-4373-8b8f-9cb0123fae57',
  contacts: 'https://functions.poehali.dev/6ecaa635-3256-43af-a8ba-2163a77dd532',
  messages: 'https://functions.poehali.dev/896c0236-c3b8-49f5-a834-422ba2f91333',
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  userId?: string
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};