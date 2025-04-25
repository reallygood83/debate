import React from 'react';
import Image from 'next/image';

interface MediaEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

const MediaEmbed = ({ url, title, className }: MediaEmbedProps) => {
  // If no URL is provided, return null
  if (!url) return null;

  // Check if the URL is a video (YouTube, Vimeo, etc.)
  const isVideo = url.match(/youtube|youtu\.be|vimeo|mp4|webm|ogg/i);
  const isYouTube = url.match(/youtube|youtu\.be/i);
  const isVimeo = url.match(/vimeo/i);

  // Get YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Get Vimeo video ID
  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    return match ? match[1] : null;
  };

  if (isVideo) {
    if (isYouTube) {
      const videoId = getYouTubeId(url);
      return (
        <div className={`aspect-video ${className || ''}`}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title || '비디오'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        </div>
      );
    } else if (isVimeo) {
      const videoId = getVimeoId(url);
      return (
        <div className={`aspect-video ${className || ''}`}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title={title || '비디오'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        </div>
      );
    } else {
      // Direct video file
      return (
        <div className={`aspect-video ${className || ''}`}>
          <video
            src={url}
            controls
            className="w-full h-full rounded-lg"
            title={title || '비디오'}
          />
        </div>
      );
    }
  } else {
    // It's an image
    return (
      <div className={`relative ${className || ''}`}>
        <Image
          src={url}
          alt={title || '이미지'}
          width={800}
          height={450}
          className="rounded-lg w-full h-auto"
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }
};

export default MediaEmbed; 