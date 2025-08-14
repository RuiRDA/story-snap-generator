import React from 'react';
import Layout from './Layout';
import FeedImageEditor from './FeedImageEditor';
import StoryImageEditor from './StoryImageEditor';

interface ImageEditingPageProps {
  headerPrimaryText: string;
  headerSecondaryText: string;
  headerSubText: string;
  feedOverlayImage: string;
  storyOverlayImage: string;
}

const ImageEditingPage: React.FC<ImageEditingPageProps> = ({
  headerPrimaryText,
  headerSecondaryText,
  headerSubText,
  feedOverlayImage,
  storyOverlayImage,
}) => {
  return (
    <Layout
      headerPrimaryText={headerPrimaryText}
      headerSecondaryText={headerSecondaryText}
      headerSubText={headerSubText}
    >
      <FeedImageEditor overlayImage={feedOverlayImage} />
      <div className="mt-8"></div>
      <StoryImageEditor overlayImage={storyOverlayImage} />
    </Layout>
  );
};

export default ImageEditingPage;