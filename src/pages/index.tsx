import type { NextPage } from 'next';
import Layout from '@/layouts/Layout';
import { Menubar } from '@/components/menubar';

const Home: NextPage = () => {
  return (
    <Layout>
      <Menubar />
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to Excel Processor</h1>
        <p className="text-gray-600">Upload and process your Excel files efficiently.</p>
      </div>
    </Layout>
  );
};

export default Home; 