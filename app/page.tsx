import Sidebar from '../components/sidebar'
import Header from '../components/header'
import NewFileSection from '../components/newFileSection'
import RecentFilesSection from '../components/recentFilesSection'


const Page = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-[#EBEBEB]">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <NewFileSection />
        <RecentFilesSection />
        
        {children}
      </div>
    </div>
  )
}

export default Page