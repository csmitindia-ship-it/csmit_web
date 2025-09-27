import React from 'react';
import { Outlet } from 'react-router-dom';

const OrganizerPage: React.FC = () => {
  return (
    <div>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default OrganizerPage;
