export async function fetchGraphQL(query, variables = {}) {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error('Failed to fetch API');
  }
  return json.data;
}

export async function getProducts() {
  const data = await fetchGraphQL(`
    query GetProducts {
      products(first: 20) {
        nodes { id name slug image { sourceUrl } }
      }
    }
  `);
  
  return data?.products?.nodes.map((p) => [
    p.name,
    'Premium LED Neon',
    p.image?.sourceUrl || '/images/products/product_01.png',
    '',
    '4,999'
  ]) || [];
}

export async function getCategories() {
  const data = await fetchGraphQL(`
    query GetCategories {
      productCategories(where: { parent: 0 }, first: 20) {
        nodes {
          id name slug
          children(first: 10) { nodes { id name slug } }
        }
      }
    }
  `);
  
  return data?.productCategories?.nodes || [];
}


export async function getConfiguratorOptions(configuratorType) {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  if (!baseUrl) throw new Error("Missing NEXT_PUBLIC_WORDPRESS_REST_URL");
  
  const res = await fetch(`${baseUrl}/neon-stack/v2/config?configurator=${configuratorType}`);
  if (!res.ok) {
    console.error("Failed to fetch configurator", await res.text());
    return null;
  }
  return res.json();
}

