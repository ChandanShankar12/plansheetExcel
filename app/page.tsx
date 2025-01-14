import SplashScreen from '@/components/SplashScreen';

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SplashScreen isOpen={true} height={584} width={624} />
    </div>
  );
}
