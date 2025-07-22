import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SharePage.css';

const SharePage = () => {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`/api/share/${id}`);
        setContent(res.data.content);
      } catch (err) {
        setError('Content not found or has expired.');
      }
      setIsLoading(false);
    };

    fetchContent();
  }, [id]);

  if (isLoading) {
    return <div className="share-page-container">Loading...</div>;
  }

  if (error) {
    return <div className="share-page-container">{error}</div>;
  }

  return (
    <div className="share-page-container">
      <h2>Shared Content</h2>
      <pre className="shared-content">{content}</pre>
    </div>
  );
};

export default SharePage;
