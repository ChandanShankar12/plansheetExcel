import RecentFilesTable from "./recentFilesSection";
import Sidebar from "./sidebar";



const MainContent = () => {
  return (
    <div className="flex flex-row">
        <Sidebar />
        <RecentFilesTable />
    </div>
  )
}

export default MainContent
