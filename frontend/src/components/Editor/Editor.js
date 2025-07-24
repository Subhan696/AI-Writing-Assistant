import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import { 
  FiCopy, 
  FiDownload, 
  FiShare2, 
  FiRotateCw, 
  FiZap, 
  FiEdit2, 
  FiCheck,
  FiPlus,
  FiTrash2,
  FiSave,
  FiFileText
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { generateAPI, shareAPI } from '../../services/api';
import { useUsage } from '../../hooks/useUsage';
import { toast } from 'react-hot-toast';
import './Editor.css';

const Editor = () => {
  // State for editor content and suggestions
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  
  // Refs
  const titleInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Authentication and usage tracking
  const { user, refreshUser } = useAuth();
  const { currentUsage, maxUsage, isPro } = useUsage();
  
  // Calculate remaining usage and percentage
  const remaining = Math.max(0, maxUsage - currentUsage);
  const usagePercentage = Math.min(100, Math.round((currentUsage / maxUsage) * 100));

  // Usage bar color based on usage
  const usageBarClass = useMemo(() => {
    const percentage = usagePercentage;
    if (isPro) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage > 90) return 'bg-gradient-to-r from-red-500 to-pink-500';
    if (percentage > 70) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  }, [currentUsage, maxUsage, isPro]);
  
  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleGeneration = async (type) => {
    if (!text.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    if (remaining <= 0 && !isPro) {
      toast.error('Daily limit reached. Upgrade to Pro for unlimited generations.');
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);

    try {
      const prompt = type === 'rephrase' 
        ? `Rephrase the following text to be more professional: "${text}"` 
        : `Continue writing about: "${text}"`;

      const response = await generateAPI.generateText(prompt);
      setSuggestions(prev => [...prev, response.data.generatedText]);
      toast.success('Text generated successfully!');
      
      // Refresh user data to update usage count
      await refreshUser();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error generating text. Please try again.';
      toast.error(errorMsg);
      console.error('Error generating text:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRephrase = () => handleGeneration('rephrase');
  const handleContinue = () => handleGeneration('continue');

  const handleCopy = (textToCopy, index) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');
    
    // Reset copied index after 2 seconds
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = async (content, type = 'txt') => {
    try {
      if (type === 'docx') {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                text: content,
                style: 'Normal',
              }),
            ],
          }],
        });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'ai-content.docx');
      } else {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'ai-content.txt');
      }
      toast.success(`Downloaded as ${type.toUpperCase()} file`);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async (content) => {
    if (!content.trim()) {
      toast.error('Please generate some content to share');
      return;
    }

    setIsSharing(true);
    try {
      const response = await shareAPI.createShare(content);
      const { shareId } = response.data;
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this AI-generated content',
          text: 'I created this with AI Writing Assistant',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing content:', err);
        toast.error('Failed to share content');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setText(prevText => `${prevText} ${suggestion}`.trim());
    toast.success('Suggestion added to your text!');
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleSave = () => {
    const newTitle = titleInputRef.current?.value.trim() || 'Untitled Document';
    setDocumentTitle(newTitle);
    setIsEditingTitle(false);
    // TODO: Save title to backend
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
      {/* Document header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                defaultValue={documentTitle}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="w-full bg-transparent text-xl font-semibold text-gray-900 dark:text-white border-0 p-0 focus:ring-2 focus:ring-blue-500 rounded"
              />
            ) : (
              <h1 
                onClick={handleTitleEdit}
                className="text-xl font-semibold text-gray-900 dark:text-white cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 -ml-2"
              >
                {documentTitle}
              </h1>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">{currentUsage}/{isPro ? '∞' : maxUsage} uses</span>
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${usageBarClass} transition-all duration-300`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
            {!isPro && (
              <button 
                onClick={() => console.log('Upgrade to Pro')}
                className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-md transition-all"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Main Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Text Input */}
          <Card className="h-full" hoverable>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Text</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setText('')}
                    disabled={!text.trim()}
                  >
                    <FiRotateCw className="mr-1" /> Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                className="min-h-[300px] w-full"
                rows={12}
              />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button 
                onClick={handleContinue}
                disabled={isGenerating || !text.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiZap className="mr-2" />
                    Continue Writing
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRephrase}
                disabled={isGenerating || !text.trim()}
                className="flex-1"
              >
                <FiEdit2 className="mr-2" />
                Rephrase
              </Button>
            </CardFooter>
          </Card>

          {/* Right Column - Suggestions */}
          <div className="space-y-6">
            {suggestions.length > 0 ? (
              <AnimatePresence>
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem 
                    key={index}
                    suggestion={suggestion}
                    index={index}
                    onCopy={handleCopy}
                    onUse={handleSuggestionClick}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    copiedIndex={copiedIndex}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/30 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <FiZap className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No suggestions yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
                  Write something and click "Continue Writing" or "Rephrase" to generate AI suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Text editor section */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Content</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => textareaRef.current?.focus()}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Focus editor"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const selection = window.getSelection();
                      const selectedText = selection.toString();
                      if (selectedText) {
                        setText(selectedText);
                        toast.success('Selected text copied to editor');
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Use selected text"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start writing or paste your content here..."
                className="w-full min-h-[300px] p-3 text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 border-0 focus:ring-2 focus:ring-blue-500 rounded-md resize-none outline-none"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap gap-2">
              <button
                onClick={handleContinue}
                disabled={isGenerating || !text.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiZap className="w-4 h-4 mr-2" />
                    Continue Writing
                  </>
                )}
              </button>
              <button
                onClick={handleRephrase}
                disabled={isGenerating || !text.trim()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                <FiRotateCw className="w-4 h-4 mr-2" />
                Rephrase
              </button>
              <div className="flex-1"></div>
              <button
                onClick={() => handleDownload(text, 'txt')}
                disabled={!text.trim()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download as Text"
              >
                <FiDownload className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                disabled={!text.trim() || isSharing}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share"
              >
                {isSharing ? (
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiShare2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Suggestions sidebar */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">AI Suggestions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {suggestions.length > 0 
                ? `${suggestions.length} suggestion${suggestions.length !== 1 ? 's' : ''} available`
                : 'No suggestions yet. Try generating some content!'}
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {suggestions.length > 0 ? (
              <AnimatePresence>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{suggestion}</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(suggestion);
                            setCopiedIndex(index);
                            toast.success('Copied to clipboard');
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setText(suggestion);
                            toast.success('Suggestion applied to editor');
                          }}
                          className="p-1.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Use this suggestion"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const newSuggestions = [...suggestions];
                          newSuggestions.splice(index, 1);
                          setSuggestions(newSuggestions);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove suggestion"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-12">
                <FiZap className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">No suggestions yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Write something and click "Continue Writing" or "Rephrase" to generate AI suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
