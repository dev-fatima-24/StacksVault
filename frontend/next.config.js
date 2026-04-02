/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STACKS_NETWORK: process.env.NEXT_PUBLIC_STACKS_NETWORK,
    NEXT_PUBLIC_REMITTANCE_CONTRACT: process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT,
    NEXT_PUBLIC_VAULT_CONTRACT: process.env.NEXT_PUBLIC_VAULT_CONTRACT,
  },
};
module.exports = nextConfig;
