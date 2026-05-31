import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateBanner = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="bg-green-100 border-b border-green-500 text-green-900 p-3 text-center flex justify-center items-center gap-4">
      <span>New content is available!</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
      >
        Reload
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-green-800 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
};

export default UpdateBanner;
