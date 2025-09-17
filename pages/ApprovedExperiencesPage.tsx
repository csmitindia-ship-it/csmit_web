import React, { useState, useEffect } from 'react';
import ThemedModal from '../components/ThemedModal'; // Adjust path as needed

interface Experience {
  id: number;
  name: string;
  email: string;
  type: 'Placement' | 'Intern';
  year_of_passing: number;
  company: string;
  linkedin_url: string;
  pdf_path: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ApprovedExperiencesPage: React.FC = () => {
  const [approvedExperiences, setApprovedExperiences] = useState<Experience[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const fetchExperiences = () => {
    fetch('http://localhost:5001/experiences') // Fetch all experiences
      .then(res => res.json())
      .then(data => {
        const approved = data.filter((exp: Experience) => exp.status === 'approved');
        setApprovedExperiences(approved);
      })
      .catch(err => console.error('Error fetching experiences:', err));
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleDeleteExperience = (id: number) => {
    setModalTitle('Confirm Deletion');
    setModalMessage('Are you sure you want to delete this experience?');
    setModalOnConfirm(() => async () => {
      try {
        const response = await fetch(`http://localhost:5001/admin/delete-experience/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();

        if (result.message) {
          fetchExperiences(); // Re-fetch to update list
          setModalTitle('Success');
          setModalMessage('Experience deleted successfully!');
          setShowConfirmButton(false);
          setIsModalOpen(true);
        } else if (result.error) {
          setModalTitle('Error');
          setModalMessage(`Error: ${result.error}`);
          setShowConfirmButton(false);
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error('Error deleting experience:', err);
        setModalTitle('Error');
        setModalMessage('Failed to delete experience.');
        setShowConfirmButton(false);
        setIsModalOpen(true);
      }
    });
    setShowConfirmButton(true);
    setIsModalOpen(true);
  };

  const getPdfUrl = (pdfPath: string) => {
    const pathParts = pdfPath.split('uploads');
    if (pathParts.length > 1) {
      const relativePath = pathParts[1].split('\\').join('/');
      return `http://localhost:5001/uploads${relativePath}`;
    }
    return '';
  };

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">Manage Approved Experiences</h1>
      
      <div className="space-y-6">
        {approvedExperiences.length > 0 ? (
          approvedExperiences.map(exp => (
            <div key={exp.id} className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-6 rounded-lg transform transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <div>
                    <p><strong className="font-semibold text-purple-400">Name:</strong> {exp.name}</p>
                    <p><strong className="font-semibold text-purple-400">Company:</strong> {exp.company}</p>
                  </div>
                </div>
                <a href={getPdfUrl(exp.pdf_path)} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto text-center px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                  View Resume
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-8 rounded-lg text-center">
            <p className="text-lg text-gray-300">No approved experiences to display.</p>
          </div>
        )}
      </div>
      <ThemedModal // Render the modal component
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        onConfirm={modalOnConfirm}
        showConfirmButton={showConfirmButton}
      />
    </>
  );
};

export default ApprovedExperiencesPage;
