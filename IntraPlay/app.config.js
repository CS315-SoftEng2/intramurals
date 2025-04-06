import 'dotenv/config';

export default {
  expo: {
    name: 'IntraPlay',
    slug: 'IntraPlay',
    extra: {
      backendUrl: process.env.BACKEND_URL,
    },
  },
};
