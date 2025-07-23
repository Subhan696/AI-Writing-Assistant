import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import { FiCopy, FiDownload, FiShare2, FiRotateCw, FiZap, FiEdit2, FiCheck } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { generateAPI, shareAPI } from '../../services/api';
import { useUsage } from '../../hooks/useUsage';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Loading } from '../ui/Loading';
import SuggestionItem from './SuggestionItem';
import { toast } from 'react-hot-toast';
import './Editor.css';

const Editor = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const textareaRef = useRef(null);
  
  const { user, refreshUser } = useContext(AuthContext);
  const { currentUsage, maxUsage, isPro, usagePercentage, remaining, usageBarClass } = useUsage();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Usage Bar */}
        {!isPro && (
          <Card className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Daily Usage</span>
                <span>{currentUsage}/{maxUsage} ({usagePercentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usageBarClass}`}
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                {remaining} {remaining === 1 ? 'use' : 'uses'} remaining
                {!isPro && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                    <a href="/upgrade" className="hover:underline">Upgrade to Pro</a>
                  </span>
                )}
              </p>
            </div>
          </Card>
        )}

        {/* Main Editor */}
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
    </div>
  );
};

export default Editor;
