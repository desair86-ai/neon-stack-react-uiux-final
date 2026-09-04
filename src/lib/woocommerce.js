import { fetchGraphQL } from "./api";

export async function addToCart(productId, quantity = 1, neonStackData = null) {
  let extraData = "";
  if (neonStackData) {
    const jsonStr = JSON.stringify({ neon_stack: neonStackData });
    const escapedJson = jsonStr.replace(/"/g, "\\\"");
    extraData = `, extraData: "${escapedJson}"`;
  }

  const query = `
    mutation AddToCart {
      addToCart(input: { productId: ${productId}, quantity: ${quantity} ${extraData} }) {
        cart {
          total
        }
      }
    }
  `;
  
  return fetchGraphQL(query);
}
