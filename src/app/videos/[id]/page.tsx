import Comments from "@/components/Comments";

export default function VideoPage({ video }) {
  return (
    <div>
      <div className="mt-8">
        <Comments videoId={video.id} />
      </div>
    </div>
  );
} 