import ChatComponent from "@/components/ChatComponent";
import FileUploader from "../components/FileUploader";
import { Suspense } from "react";

//test
export default function Home() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen  bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="w-full md:w-1/3 h-auto md:h-full border-b md:border-b-0 md:border-r border-gray-800 flex flex-col bg-gray-900/90 backdrop-blur-sm">
        <div className="p-4 md:p-6 border-b border-gray-800 bg-gradient-to-r from-indigo-700 to-purple-700">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            PDF Chat
          </h1>
          <p className="text-xs md:text-sm text-indigo-200 mt-1 md:mt-2">
            Upload and chat with your PDF documents
          </p>
        </div>  
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <FileUploader />
          </Suspense>
        </div>
      </div>
      <div className="w-full md:w-2/3 h-full flex flex-col bg-gray-900/90 backdrop-blur-sm">
        <div className="p-4 md:p-6 border-b border-gray-800 bg-gradient-to-r from-purple-700 to-pink-700">
          <h2 className="text-xl md:text-2xl font-semibold text-white">Chat</h2>
        </div>
        <div className="flex-1 p-2 md:p-6 min-h-0">
          <Suspense fallback={<div>Loading...</div>}>
            <ChatComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
