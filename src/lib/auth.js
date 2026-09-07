export async function loginUser(username, password) {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation LoginUser($username: String!, $password: String!) {
        login(input: { clientMutationId: "1", username: $username, password: $password }) {
          authToken
          user { id databaseId username email firstName lastName }
        }
      }`,
      variables: { username, password }
    })
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.login;
}

export async function registerUser(email, password, firstName, lastName) {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation RegisterUser($email: String!, $password: String!, $firstName: String, $lastName: String) {
        registerUser(input: { clientMutationId: "1", username: $email, email: $email, password: $password, firstName: $firstName, lastName: $lastName }) {
          user { id databaseId email }
        }
      }`,
      variables: { email, password, firstName, lastName }
    })
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.registerUser;
}

export async function getCustomerOrders(token) {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `query GetCustomerOrders {
        customer {
          orders {
            nodes {
              databaseId
              orderKey
              total
              status
              date
              lineItems { nodes { product { node { name } } quantity total } }
            }
          }
        }
      }`
    })
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.customer?.orders?.nodes || [];
}
