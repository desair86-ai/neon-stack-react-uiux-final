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

export async function getFeaturedProducts() {
  const data = await fetchGraphQL(`
    query GetFeaturedProducts {
      products(first: 3, where: { featured: true }) {
        nodes {
          id name slug image { sourceUrl }
          ... on SimpleProduct { regularPrice salePrice }
          ... on VariableProduct { regularPrice salePrice }
        }
      }
    }
  `);
  const nodes = data?.products?.nodes || [];
  return nodes.map((p) => {
    let price = '4,999';
    if (p.salePrice && p.regularPrice) {
      price = p.salePrice.replace(/[^0-9.,]+/g, '');
    } else if (p.regularPrice) {
      price = p.regularPrice.replace(/[^0-9.,]+/g, '');
    }
    return {
      name: p.name,
      image: p.image?.sourceUrl || '',
      price: price
    };
  });
}

export async function getProducts(categorySlug = null) {
  const whereArg = categorySlug ? `where: { categoryIn: ["${categorySlug}"] }` : "";
  const data = await fetchGraphQL(`
    query GetProducts {
      products(first: 100, ${whereArg}) {
        nodes {
          id name slug image { sourceUrl }
          productCategories { nodes { slug name } }
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
  
  return (data?.productCategories?.nodes || []).filter(c => c.name !== "Uncategorized");
}


export async function getConfiguratorOptions(configuratorType = 'custom_neon') {
  try {
    const res = await fetch(`/api/config?configurator=${configuratorType}`);
    if (!res.ok) {
      console.error('Failed to fetch configurator via proxy', await res.text());
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Network error fetching configurator via proxy', error);
    return null;
  }
}

