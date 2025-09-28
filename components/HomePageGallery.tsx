import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function HomePageGallery() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:5001/gallery')
      .then(res => res.json())
      .then(data => setImageUrls(data))
      .catch(err => console.error('Error fetching gallery images:', err));
  }, []);

  const imagesToShow = imageUrls.slice(0, 6);

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">Gallery</h2>
      <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto text-center">
      A glimpse into our journey — moments of creativity, teamwork, and innovation captured in frames.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {imagesToShow.map((url, index) => (
          <div key={index} className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-2 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
            <img src={url} alt={`Gallery image ${index + 1}`} className="w-full h-48 object-cover rounded-md" />
          </div>
        ))}
      </div>
      {imageUrls.length > 6 && (
        <div className="text-center mt-8">
          <Link to="/gallery" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg glow-button">
            Show More <FiArrowRight className="ml-2" />
          </Link>
        </div>
      )}
    </section>
  );
}
