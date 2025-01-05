import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-primaryColor text-white h-screen flex flex-col justify-between p-4">
      <nav>
        <ul className="space-y-4">
          <li className="hover:underline"><Link href="/">Home Page</Link></li>
          <li className="hover:underline"><Link href="/new-file">New File</Link></li>
          <li className="hover:underline"><Link href="/open-file">Open File</Link></li>
          <li className="hover:underline"><Link href="/share-file">Share File</Link></li>
        </ul>
      </nav>
      <div className="border-t border-green-500 pt-4">
        <Link href="/profile">Profile</Link>
        <Link href="/settings">Settings</Link>
      </div>
    </aside>
  );
};

export default Sidebar;
