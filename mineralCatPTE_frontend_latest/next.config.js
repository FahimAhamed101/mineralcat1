/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // React Strict Mode চালু
  images: {
    domains: ['res.cloudinary.com'], // Cloudinary ডোমেন যোগ করা হলো
  },
  typescript: {
    ignoreBuildErrors: true, // TypeScript এর ত্রুটিগুলো এড়াতে ব্যবহার করা যায় (যদি আপনি TypeScript ব্যবহার করেন)
  },
};

module.exports = nextConfig;
