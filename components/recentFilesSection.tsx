"Use Client"


const RecentFilesTable = () => {
    const files = [
      { name: '303_MDA 2024 Boothplan', members: 'Aditi', date: '28/11/31 11:28AM' },
      { name: '303_MDA 2024 Boothplan', members: 'Shri. Hari Ram Prasad', date: '28/11/31 11:28AM' },
    ];
  
    return (
      <section className="p-4">
        <input
          type="text"
          placeholder="Search by Booth number, supervisor name, employee name"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-200 text-left">Name</th>
              <th className="p-2 border border-gray-200 text-left">Members</th>
              <th className="p-2 border border-gray-200 text-left">Created On</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border border-gray-200">{file.name}</td>
                <td className="p-2 border border-gray-200">{file.members}</td>
                <td className="p-2 border border-gray-200">{file.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  };
  
  export default RecentFilesTable;
  