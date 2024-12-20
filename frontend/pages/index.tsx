import type { NextPage } from 'next';
import Layout from '../components/Layout';

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1>Welcome to Excel Processor</h1>
      </div>
    </Layout>
  );
};

export default Home; 