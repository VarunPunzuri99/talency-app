/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            {
                source: '/auth',
                destination: '/auth/login',
                permanent: true,
            },
            {
                source: '/sales',
                destination: '/sales/dashboard',
                permanent: false,
            },
            {
                source: '/email',
                destination: '/email/inbox',
                permanent: true,
            },
            {
                source: '/internals',
                destination: '/internals/dashboard',
                permanent: false,
            },
            {
                source: '/jobs',
                destination: '/jobs/dashboard',
                permanent: false,
            },
            {
                source: '/settings',
                destination: '/settings/career',
                permanent: false,
            },
        ];
    },
};

module.exports = nextConfig
