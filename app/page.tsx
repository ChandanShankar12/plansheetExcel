import SplashScreen from "components/SplashScreen";

const Page = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
    <div className="flex flex-col">
        <SplashScreen />
      </div>
    </>
  );
};

export default Page;