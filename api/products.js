export default async function handler(req, res) {
  // Add your WordPress site URL here
  const WP_URL = process.env.VITE_WP_API_URL || 'https://your-wordpress-site.com/wp-json/wc/v3';
  const WP_CONSUMER_KEY = process.env.WP_CONSUMER_KEY;
  const WP_CONSUMER_SECRET = process.env.WP_CONSUMER_SECRET;

  try {
    // For WooCommerce REST API
    // const response = await fetch(`${WP_URL}/products?consumer_key=${WP_CONSUMER_KEY}&consumer_secret=${WP_CONSUMER_SECRET}`);
    
    // For WP REST API (Custom Post Type 'products' or similar)
    const response = await fetch(`${WP_URL}/wp/v2/products`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products from WordPress');
    }
    
    const products = await response.json();
    
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    // Fallback mock data in case WordPress isn't connected yet
    res.status(200).json([
      { id: 1, name: 'Gaming Controller', category: 'Gaming', price: '1,499', image: '', tag: 'BESTSELLER' },
      { id: 2, name: 'Astronaut On Moon', category: 'Astronaut & Space', price: '1,999', image: '', tag: 'MOJO MIX' }
    ]);
  }
}
