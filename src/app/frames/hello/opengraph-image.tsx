import { ImageResponse } from "next/server";

export const runtime = "edge";

export const alt = "Hello Frame";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div className="h-full w-full flex flex-col justify-center items-center relative bg-white">
        <h1 className="text-6xl">Hello, world! testing</h1>
      </div>
    ),
    {
      ...size,
    }
  );
}
