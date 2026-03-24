export default function ClearBooksNW() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">Loading ClearBooks NW...</p>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.href = '/cbnw/index.html';`
      }} />
    </div>
  );
}
