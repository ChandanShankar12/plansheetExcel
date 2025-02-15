// 'use client';

// import Image from 'next/image';
// import { greetingAccordingToTime } from '../utils/utils';
// import { useSpreadsheetContext } from '@/hooks/spreadsheet-context';
// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { Application } from '@/server/models/application';

// interface SplashScreenProps {
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// interface RecentFile {
//   name: string;
//   lastModified: string;
// }

// export default function SplashScreen({ isOpen = true, onClose }: SplashScreenProps) {
//   const { application, setApplication } = useSpreadsheetContext();
//   const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

 

//   const handleNewFile = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get('/api/file?type=new');
      
//       if (response.data.success) {
//         const newApp = Application.fromJSON(response.data.application);
//         setApplication(newApp);
//         onClose?.();
//       }
//     } catch (error) {
//       console.error('Error creating new file:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOpenFile = async () => {
//     try {
//       const input = document.createElement('input');
//       input.type = 'file';
//       input.accept = '.dtst';
      
//       input.onchange = async (e) => {
//         const file = (e.target as HTMLInputElement).files?.[0];
//         if (file) {
//           setIsLoading(true);
//           const formData = new FormData();
//           formData.append('file', file);

//           const response = await axios.post('/api/file', formData, {
//             headers: {
//               'Content-Type': 'multipart/form-data'
//             }
//           });

//           if (response.data.success) {
//             const loadedApp = Application.fromJSON(response.data.application);
//             setApplication(loadedApp);
//             onClose?.();
//           }
//         }
//       };
      
//       input.click();
//     } catch (error) {
//       console.error('Error opening file:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };



//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ height: "32" }}
//           animate={{ height: "32%" }}
//           exit={{ height: 0 }}
//           transition={{ duration: 0.3, ease: "easeInOut" }}
//           className="relative flex flex-row bg-primaryColor overflow-hidden"
//         >
//           <div className="flex flex-row justify-between items-start p-16 w-full">
//             {/* Left Section - Logo and Title */}
//             <div className="flex flex-col justify-center">
//               <div>
//                 <Image
//                   src="/images/Group 91.svg"
//                   alt="logo"
//                   width={100}
//                   height={100}
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[24px] text-white font-semibold tracking-[0.72px]">
//                   {greetingAccordingToTime()}
//                 </span>
//                 <span className="text-[10px] text-white font-semibold tracking-[0.72px]">
//                   Personal Edition
//                 </span>
//               </div>
//             </div>

//             {/* Center Section - Actions */}
//             <div className="flex flex-col gap-4">
//               <button
//                 onClick={handleNewFile}
//                 disabled={isLoading}
//                 className="flex items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
//               >
//                 <Image
//                   src="/images/new-file.svg"
//                   alt="new file"
//                   width={24}
//                   height={24}
//                 />
//                 <span className="text-white">
//                   {isLoading ? 'Creating...' : 'New File'}
//                 </span>
//               </button>

//               <button
//                 onClick={handleOpenFile}
//                 className="flex items-center gap-2 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
//               >
//                 <Image
//                   src="/images/open-file.svg"
//                   alt="open file"
//                   width={24}
//                   height={24}
//                 />
//                 <span className="text-white">Open file</span>
//               </button>
//             </div>

//             {/* Right Section - Recent Files */}
//             <div className="flex flex-col gap-4">
//               <span className="text-white font-medium text-xl">Recent Files</span>
//               <div className="flex flex-col gap-2">
//                 {recentFiles.map((file, index) => (
//                   <button
//                     key={index}
//                     onClick={() => {}}
//                     className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors w-[300px]"
//                   >
//                     <div className="flex items-center gap-2">
//                       <Image src="/images/file.svg" alt="file" width={20} height={20} />
//                       <span className="text-white text-sm truncate">
//                         {file.name}
//                       </span>
//                     </div>
//                     <span className="text-white/60 text-xs">
//                       {new Date(file.lastModified).toLocaleDateString()}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
