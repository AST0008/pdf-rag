"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploading(true);
      setIsSuccess(false);

      try {
        const formData = new FormData();
        formData.append("pdf", selectedFile);

        const response = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        setIsSuccess(true);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="border-2 border-dashed border-purple-800 rounded-2xl p-10 text-center bg-gradient-to-br from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 transition-colors shadow-lg"
      >
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ scale: isUploading ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 1.5, repeat: isUploading ? Infinity : 0 }}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            ) : (
              <Upload className="h-10 w-10 text-purple-400" />
            )}
          </motion.div>

          <div className="text-sm text-gray-200">
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                <span>Uploading...</span>
              </div>
            ) : file ? (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>{file.name}</span>
              </div>
            ) : (
              "Click to upload or drag and drop PDF"
            )}
          </div>

          {!file && <p className="text-xs text-gray-400">PDF files only</p>}
        </label>
      </motion.div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 text-green-400 font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            File uploaded successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
