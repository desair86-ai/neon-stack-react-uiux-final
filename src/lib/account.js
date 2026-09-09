export async function getCurrentCustomer(token) {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `query GetCurrentCustomer {
        customer {
          id
          databaseId
          username
          email
          firstName
          lastName
        }
      }`,
    }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'Failed to fetch customer');
  return json.data?.customer || null;
}

export async function getWooCommerceCustomer(customerId) {
  const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!siteUrl || !consumerKey || !consumerSecret) {
    throw new Error('Missing WooCommerce API credentials');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await fetch(
    `${siteUrl.replace(/\/$/, '')}/wc/v3/customers/${customerId}`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce API error: ${res.status}`);
  }

  return res.json();
}

export async function updateWooCommerceCustomer(customerId, data) {
  const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!siteUrl || !consumerKey || !consumerSecret) {
    throw new Error('Missing WooCommerce API credentials');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await fetch(
    `${siteUrl.replace(/\/$/, '')}/wc/v3/customers/${customerId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    let message = `WooCommerce API error: ${res.status}`;
    try {
      const err = JSON.parse(text);
      message = err.message || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return res.json();
}

export async function updateCustomerPassword(customerId, newPassword) {
  const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!siteUrl || !consumerKey || !consumerSecret) {
    throw new Error('Missing WooCommerce API credentials');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await fetch(
    `${siteUrl.replace(/\/$/, '')}/wc/v3/customers/${customerId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    let message = `WooCommerce API error: ${res.status}`;
    try {
      const err = JSON.parse(text);
      message = err.message || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return res.json();
}
