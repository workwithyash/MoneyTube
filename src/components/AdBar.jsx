import React, { useEffect } from "react";

export default function AdBar() {
  useEffect(() => {
    try {
      if (window.adsbygoogle && process.env.NODE_ENV === "production") {
        window.adsbygoogle.push({});
      }
    } catch (e) {}
  }, []);

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <ins className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2929441200902290"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
  );
} 