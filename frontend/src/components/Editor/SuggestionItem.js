import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiDownload, FiShare2, FiCheck, FiEdit2 } from 'react-icons/fi';
import Button from '../ui/Button';

const SuggestionItem = ({ 
  suggestion, 
  index, 
  onCopy, 
  onUse, 
  onDownload, 
  onShare, 
  copiedIndex 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {suggestion}
          </p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onCopy(suggestion, index)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {copiedIndex === index ? (
              <FiCheck className="mr-1.5" />
            ) : (
              <FiCopy className="mr-1.5" />
            )}
            {copiedIndex === index ? 'Copied!' : 'Copy'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onUse(suggestion)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FiEdit2 className="mr-1.5" />
            Use
          </Button>
          
          <div className="relative group">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiDownload className="mr-1.5" />
              Download
            </Button>
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 shadow-lg rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onDownload(suggestion, 'txt')}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                As TXT
              </button>
              <button
                onClick={() => onDownload(suggestion, 'docx')}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                As DOCX
              </button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onShare(suggestion)}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <FiShare2 className="mr-1.5" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SuggestionItem;
