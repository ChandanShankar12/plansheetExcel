
import HeroSection from '../components/HeroSection'
import MainContent from '../components/MainContent'

const Page = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <HeroSection height={132} />
      <MainContent />
    </>
  )
}

export default Page;