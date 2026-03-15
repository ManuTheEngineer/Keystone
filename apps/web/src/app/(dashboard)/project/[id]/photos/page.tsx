import { PhotosClient } from "./_client";
export default function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
  return <PhotosClient />;
}
