export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  
  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjI2ODQzOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxODA4RUUzMjBlREY2NGMwMTlBNmJiMEY3RTRiRkIzZDYyRjA2RWMifQ",
      payload: "eyJkb21haW4iOiJkZWdlbi1vZy52ZXJjZWwuYXBwIn0",
      signature: "MHg5ZjgzYTllOWU5ODQxN2FhODVlYmNiNzAwMzE4MjY1Y2ZjYjQwNDk2MzRjZGEyYWJlNmZiYjA2YTMxYWFlYjJjMmNlYjkwZjkxZDQxNWFmZjE4ZDVhYTlmZmJjMmE5ZmY5YWRmMDE4NDA5NDRmN2I0NzkyN2JhNzMyOWY2YjIwMDFj"
    },
    frame: {
      version: "1",
      name: "Frames v2 Demo",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
