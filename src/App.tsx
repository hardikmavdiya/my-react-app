// frontend/src/App.tsx
import React, { useState } from 'react';
import './App.css'; // Import the CSS file for styling

function App() {
  // State variables to hold form input values
  const [niche, setNiche] = useState<string>('');
  const [successfulContentTypes, setSuccessfulContentTypes] = useState<string>('');
  const [platformType, setPlatformType] = useState<string>('');

  // State variables to manage the output and UI feedback
  const [ideas, setIdeas] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Handles the form submission.
   * Prevents default form behavior, sends data to the backend,
   * and updates the UI based on the response.
   * @param event The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the browser from reloading the page

    // Reset previous states and show loading indicator
    setLoading(true);
    setError('');
    setIdeas('');

    try {
      // Make a POST request to your Flask backend API endpoint
      const response = await fetch('https://flask-gemini-backend-138659766439.asia-south1.run.app/api/generate_ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify that we are sending JSON data
        },
        // Convert the form data into a JSON string for the request body
        body: JSON.stringify({
          niche,
          successful_content_types: successfulContentTypes,
          platform_type: platformType,
        }),
      });

      // Check if the HTTP response was successful (status code 200-299)
      if (!response.ok) {
        // If not successful, parse the error message from the backend
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Parse the successful JSON response from the backend
      const data = await response.json();
      // Update the 'ideas' state with the generated content
      setIdeas(data.ideas);
    } catch (err: any) {
      // Catch and display any errors during the fetch operation
      setError(err.message);
      console.error("Error fetching ideas:", err);
    } finally {
      // Always set loading to false after the request completes (success or failure)
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Content Idea Generator</h1>
        <p>Get creative content ideas for your social media platforms!</p>

        <form onSubmit={handleSubmit} className="idea-form">
          <div className="form-group">
            <label htmlFor="niche">Niche (e.g., "Sustainable Living", "Tech Gadgets"):</label>
            <input
              type="text"
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              required // Make this field mandatory
              placeholder="e.g., Fitness, Gaming, Cooking"
            />
          </div>

          <div className="form-group">
            <label htmlFor="successfulContentTypes">Successful Content Types (comma-separated, e.g., "DIY guides, product reviews"):</label>
            <input
              type="text"
              id="successfulContentTypes"
              value={successfulContentTypes}
              onChange={(e) => setSuccessfulContentTypes(e.target.value)}
              placeholder="e.g., Tutorials, Vlogs, Short-form videos"
            />
          </div>

          <div className="form-group">
            <label htmlFor="platformType">Platform Type (e.g., "YouTube", "Instagram", "TikTok"):</label>
            <input
              type="text"
              id="platformType"
              value={platformType}
              onChange={(e) => setPlatformType(e.target.value)}
              required // Make this field mandatory
              placeholder="e.g., YouTube, Instagram, Blog"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Generating Ideas...' : 'Generate Ideas'}
          </button>
        </form>

        {/* Display error message if any */}
        {error && <p className="error-message">Error: {error}</p>}

        {/* Display generated ideas if available */}
        {ideas && (
          <div className="ideas-output">
            <h2>Generated Content Ideas:</h2>
            {/* Using dangerouslySetInnerHTML to render potentially formatted text from Gemini.
                Be cautious with this if you're not sure about the source of the HTML.
                For plain text, just use {ideas} */}
            <pre dangerouslySetInnerHTML={{ __html: ideas }}></pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
