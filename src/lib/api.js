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
      products(first: 50) {
        nodes {
          id name slug image { sourceUrl }
          ... on SimpleProduct { regularPrice salePrice attributes { nodes { name options } } }
          ... on VariableProduct { regularPrice salePrice attributes { nodes { name options } } }
        }
      }
    }
  `);
  
  const nodes = data?.products?.nodes || [];
  let maxPrice = 4999;
  let sizesSet = new Set();
  
  const mapped = nodes.map((p) => {
    let badge = '';
    let price = '4,999';
    let rawPrice = 4999;
    if (p.salePrice && p.regularPrice) {
      const sale = parseFloat(p.salePrice.replace(/[^0-9.-]+/g, ''));
      const reg = parseFloat(p.regularPrice.replace(/[^0-9.-]+/g, ''));
      if (reg > sale && reg > 0) {
        const discount = Math.round(((reg - sale) / reg) * 100);
        badge = discount + '% OFF';
      }
      price = p.salePrice.replace(/[^0-9.,]+/g, '');
      rawPrice = sale;
    } else if (p.regularPrice) {
      price = p.regularPrice.replace(/[^0-9.,]+/g, '');
      rawPrice = parseFloat(p.regularPrice.replace(/[^0-9.-]+/g, ''));
    }
    
    if (rawPrice > maxPrice) maxPrice = rawPrice;
    
    if (p.attributes && p.attributes.nodes) {
      const sizeAttr = p.attributes.nodes.find(a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'pa_size');
      if (sizeAttr && sizeAttr.options) {
        sizeAttr.options.forEach(opt => sizesSet.add(opt));
      }
    }
    
    return [
      p.name,
      'Premium LED Neon',
      p.image?.sourceUrl || '/images/products/product_01.png',
      badge,
      price,
      rawPrice
    ];
  });
  
  return {
    items: mapped,
    maxPrice,
    sizes: Array.from(sizesSet)
  };
}

export async function getCategories() {
  const data = await fetchGraphQL(`
    query GetCategories {
      productCategories(where: { parent: 0 }, first: 20) {
        nodes {
          id name slug
          children(first: 10) { nodes { id name slug image { sourceUrl } } }
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

