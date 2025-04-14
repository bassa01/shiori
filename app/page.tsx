import React from 'react';
import Layout from './components/Layout';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import dayjs from 'dayjs';
import HomeClientActions from './components/HomeClientActions';
import ItineraryList from './components/ItineraryList';

export const dynamic = 'force-dynamic';

export default function Home() {

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">旅のしおり</h1>
          <HomeClientActions />
        </div>

        <ItineraryList />
      </div>
    </Layout>
  );
}
